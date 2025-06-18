import { Router, Request, Response } from 'express';
import { mockServerState } from '../state';

const router = Router();

// Get all plants
router.get('/', (req: Request, res: Response) => {
  const state = mockServerState.getState();
  res.json(Object.values(state.plants));
});

// Get plant by ID
router.get('/:id', (req: Request, res: Response) => {
  const state = mockServerState.getState();
  const plant = state.plants[req.params.id];
  
  if (!plant) {
    return res.status(404).json({
      error: {
        code: 'PLANT_NOT_FOUND',
        message: `Plant with ID ${req.params.id} not found`
      }
    });
  }

  res.json(plant);
});

// Create new plant
router.post('/', (req: Request, res: Response) => {
  const plantId = `plant-${Date.now()}`;
  const plant = {
    id: plantId,
    ...req.body,
    createdAt: new Date().toISOString()
  };

  mockServerState.updateState('plants', plantId, plant);
  res.status(201).json(plant);
});

// Update plant
router.put('/:id', (req: Request, res: Response) => {
  const state = mockServerState.getState();
  const plant = state.plants[req.params.id];

  if (!plant) {
    return res.status(404).json({
      error: {
        code: 'PLANT_NOT_FOUND',
        message: `Plant with ID ${req.params.id} not found`
      }
    });
  }

  const updatedPlant = {
    ...plant,
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  mockServerState.updateState('plants', req.params.id, updatedPlant);
  res.json(updatedPlant);
});

// Delete plant
router.delete('/:id', (req: Request, res: Response) => {
  const state = mockServerState.getState();
  const plant = state.plants[req.params.id];

  if (!plant) {
    return res.status(404).json({
      error: {
        code: 'PLANT_NOT_FOUND',
        message: `Plant with ID ${req.params.id} not found`
      }
    });
  }

  mockServerState.deleteFromState('plants', req.params.id);
  res.sendStatus(204);
});

export default router; 