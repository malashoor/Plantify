import { mockServerState } from '../state';

export interface JournalEntry {
  id: string;
  plantId: string;
  note: string;
  mood?: 'happy' | 'neutral' | 'sad';
  images?: string[];
  timestamp: string;
  tags?: string[];
}

export const journalScenarios = {
  /**
   * Simulate large payload handling
   * @param entryCount Number of entries to generate
   */
  simulateLargePayload(entryCount: number) {
    const entries: JournalEntry[] = Array.from({ length: entryCount }, (_, i) => ({
      id: `journal-${Date.now()}-${i}`,
      plantId: `plant-${i % 10}`, // Cycle through 10 plants
      note: `Test note ${i} with some extra content to increase payload size. ${'.'.repeat(100)}`,
      mood: i % 3 === 0 ? 'happy' : i % 3 === 1 ? 'neutral' : 'sad',
      images: Array.from({ length: 3 }, (_, j) => `image-${i}-${j}.jpg`),
      timestamp: new Date(Date.now() - i * 86400000).toISOString(),
      tags: [`tag-${i % 5}`, `category-${i % 3}`],
    }));

    entries.forEach(entry => {
      mockServerState.updateState('journal', entry.id, entry);
    });

    // Simulate slow response due to large payload
    mockServerState.setMockResponse('/api/journal', {
      delay: Math.min(entryCount * 100, 5000), // Cap at 5 seconds
      data: entries,
    });
  },

  /**
   * Simulate conditional failure based on mood
   */
  simulateFailOnSadMood() {
    mockServerState.setMockResponse('/api/journal', {
      status: req => {
        if (req.body.mood === 'sad') {
          return 422;
        }
        return 201;
      },
      data: req => {
        if (req.body.mood === 'sad') {
          return {
            error: {
              code: 'MOOD_NOT_ALLOWED',
              message: 'Cannot save journal entries with sad mood',
            },
          };
        }

        const entryId = `journal-${Date.now()}`;
        const entry = {
          id: entryId,
          ...req.body,
          timestamp: new Date().toISOString(),
        };
        mockServerState.updateState('journal', entryId, entry);
        return entry;
      },
    });
  },

  /**
   * Simulate server-side save delay
   * @param delayMs Delay in milliseconds
   */
  simulateSaveDelay(delayMs: number) {
    mockServerState.setMockResponse('/api/journal', {
      delay: delayMs,
      status: 201,
      data: req => {
        const entryId = `journal-${Date.now()}`;
        const entry = {
          id: entryId,
          ...req.body,
          timestamp: new Date().toISOString(),
        };
        mockServerState.updateState('journal', entryId, entry);
        return entry;
      },
    });
  },

  /**
   * Simulate dependency chain with plant service
   * @param plantId Plant ID to depend on
   */
  simulatePlantDependency(plantId: string) {
    mockServerState.setMockResponse('/api/journal', {
      status: req => {
        const state = mockServerState.getState();
        if (!state.plants[plantId]) {
          return 424; // Failed Dependency
        }
        return 201;
      },
      data: req => {
        const state = mockServerState.getState();
        if (!state.plants[plantId]) {
          return {
            error: {
              code: 'PLANT_NOT_FOUND',
              message: `Cannot create journal entry: Plant ${plantId} not found`,
              dependency: {
                service: 'plants',
                id: plantId,
              },
            },
          };
        }

        const entryId = `journal-${Date.now()}`;
        const entry = {
          id: entryId,
          ...req.body,
          plantId,
          timestamp: new Date().toISOString(),
        };
        mockServerState.updateState('journal', entryId, entry);
        return entry;
      },
    });
  },

  /**
   * Simulate batch operation with partial success
   * @param entries Array of journal entries to process
   * @param failureRate Probability of each entry failing (0-1)
   */
  simulateBatchPartialSuccess(entries: Partial<JournalEntry>[], failureRate: number) {
    mockServerState.setMockResponse('/api/journal/batch', {
      status: 207, // Multi-Status
      data: () => {
        const results = entries.map(entry => {
          if (Math.random() < failureRate) {
            return {
              success: false,
              error: {
                code: 'BATCH_ENTRY_FAILED',
                message: 'Failed to process entry',
              },
              entry,
            };
          }

          const entryId = `journal-${Date.now()}`;
          const savedEntry = {
            id: entryId,
            ...entry,
            timestamp: new Date().toISOString(),
          };
          mockServerState.updateState('journal', entryId, savedEntry);
          return {
            success: true,
            entry: savedEntry,
          };
        });

        return {
          results,
          summary: {
            total: entries.length,
            succeeded: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
          },
        };
      },
    });
  },

  /**
   * Reset all journal scenarios
   */
  reset() {
    mockServerState.clearMockResponse('/api/journal');
    mockServerState.clearMockResponse('/api/journal/batch');
  },
};
