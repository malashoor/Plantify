import { mockServerState } from '../state';

export interface PlantValidationError {
  field: string;
  message: string;
}

export const plantScenarios = {
  /**
   * Simulates a scenario where plant saves start succeeding but then fail after a certain number
   * @param successCount Number of successful saves before failure
   */
  failAfterMultipleSaves(successCount: number) {
    let saveAttempts = 0;

    mockServerState.setMockResponse('/api/plants', {
      status: req => {
        saveAttempts++;
        if (saveAttempts > successCount) {
          return 500;
        }
        return 201;
      },
      data: req => {
        if (saveAttempts > successCount) {
          return {
            error: {
              code: 'SAVE_LIMIT_EXCEEDED',
              message: 'Too many plant saves in short period',
            },
          };
        }
        const plantId = `plant-${Date.now()}`;
        const plant = {
          id: plantId,
          ...req.body,
          createdAt: new Date().toISOString(),
        };
        mockServerState.updateState('plants', plantId, plant);
        return plant;
      },
    });
  },

  /**
   * Simulates partial success where metadata saves but photo upload fails
   */
  partialPhotoUploadFailure() {
    mockServerState.setMockResponse('/api/plants', {
      status: 201,
      data: req => {
        const plantId = `plant-${Date.now()}`;
        const plant = {
          id: plantId,
          ...req.body,
          createdAt: new Date().toISOString(),
          photoStatus: 'pending',
        };
        mockServerState.updateState('plants', plantId, plant);
        return plant;
      },
    });

    mockServerState.setMockResponse('/api/plants/*/photo', {
      status: 500,
      error: {
        code: 'PHOTO_UPLOAD_FAILED',
        message: 'Failed to upload photo to storage',
      },
    });
  },

  /**
   * Simulates a plant being deleted while updates are in the retry queue
   * @param plantId ID of plant to simulate as deleted
   */
  simulateDeletedPlantDuringRetry(plantId: string) {
    mockServerState.setMockResponse(`/api/plants/${plantId}`, {
      status: 404,
      error: {
        code: 'PLANT_NOT_FOUND',
        message: `Plant with ID ${plantId} was deleted`,
      },
    });

    // Also delete from state to simulate complete removal
    mockServerState.deleteFromState('plants', plantId);
  },

  /**
   * Simulates validation errors for plant data
   * @param errors List of field validation errors
   */
  simulateValidationErrors(errors: PlantValidationError[]) {
    mockServerState.setMockResponse('/api/plants', {
      status: 400,
      data: {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid plant data',
          details: errors,
        },
      },
    });
  },

  /**
   * Simulates a complex retry scenario where updates eventually succeed
   * @param attempts Number of attempts before success
   * @param plantId Target plant ID
   */
  eventualUpdateSuccess(attempts: number, plantId: string) {
    let updateAttempts = 0;

    mockServerState.setMockResponse(`/api/plants/${plantId}`, {
      status: req => {
        updateAttempts++;
        if (updateAttempts >= attempts) {
          return 200;
        }
        return 500;
      },
      data: req => {
        if (updateAttempts >= attempts) {
          const plant = {
            id: plantId,
            ...req.body,
            updatedAt: new Date().toISOString(),
          };
          mockServerState.updateState('plants', plantId, plant);
          return plant;
        }
        return {
          error: {
            code: 'UPDATE_FAILED',
            message: `Update attempt ${updateAttempts} failed`,
          },
        };
      },
    });
  },

  /**
   * Simulates permanent failure after max retries
   * @param maxAttempts Number of attempts before permanent failure
   */
  permanentFailure(maxAttempts: number) {
    let attempts = 0;

    mockServerState.setMockResponse('/api/plants', {
      status: req => {
        attempts++;
        if (attempts >= maxAttempts) {
          return 410; // Gone - indicates permanent failure
        }
        return 500;
      },
      data: req => ({
        error: {
          code: attempts >= maxAttempts ? 'PERMANENT_FAILURE' : 'TEMPORARY_ERROR',
          message:
            attempts >= maxAttempts
              ? 'Operation permanently failed'
              : `Attempt ${attempts} failed, may retry`,
        },
      }),
    });
  },

  /**
   * Reset all plant scenarios
   */
  reset() {
    mockServerState.clearMockResponse('/api/plants');
    mockServerState.clearMockResponse('/api/plants/*/photo');
  },
};
