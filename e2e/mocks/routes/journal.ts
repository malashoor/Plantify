import { Router, Request, Response } from 'express';
import { mockServerState } from '../state';

const router = Router();

// Get all journal entries
router.get('/', (req: Request, res: Response) => {
  const state = mockServerState.getState();
  res.json(Object.values(state.journal));
});

// Get journal entry by ID
router.get('/:id', (req: Request, res: Response) => {
  const state = mockServerState.getState();
  const entry = state.journal[req.params.id];

  if (!entry) {
    return res.status(404).json({
      error: {
        code: 'JOURNAL_ENTRY_NOT_FOUND',
        message: `Journal entry with ID ${req.params.id} not found`,
      },
    });
  }

  res.json(entry);
});

// Create new journal entry
router.post('/', (req: Request, res: Response) => {
  const entryId = `journal-${Date.now()}`;
  const entry = {
    id: entryId,
    ...req.body,
    createdAt: new Date().toISOString(),
  };

  mockServerState.updateState('journal', entryId, entry);
  res.status(201).json(entry);
});

// Update journal entry
router.put('/:id', (req: Request, res: Response) => {
  const state = mockServerState.getState();
  const entry = state.journal[req.params.id];

  if (!entry) {
    return res.status(404).json({
      error: {
        code: 'JOURNAL_ENTRY_NOT_FOUND',
        message: `Journal entry with ID ${req.params.id} not found`,
      },
    });
  }

  const updatedEntry = {
    ...entry,
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  mockServerState.updateState('journal', req.params.id, updatedEntry);
  res.json(updatedEntry);
});

// Delete journal entry
router.delete('/:id', (req: Request, res: Response) => {
  const state = mockServerState.getState();
  const entry = state.journal[req.params.id];

  if (!entry) {
    return res.status(404).json({
      error: {
        code: 'JOURNAL_ENTRY_NOT_FOUND',
        message: `Journal entry with ID ${req.params.id} not found`,
      },
    });
  }

  mockServerState.deleteFromState('journal', req.params.id);
  res.sendStatus(204);
});

export default router;
