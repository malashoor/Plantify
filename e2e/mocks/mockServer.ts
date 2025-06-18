import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import { mockServerState, MockResponse } from './state';
import plantsRouter from './routes/plants';
import journalRouter from './routes/journal';
import weatherRouter from './routes/weather';

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  mockServerState.logRequest({
    method: req.method,
    path: req.path,
    body: req.body,
    headers: req.headers as Record<string, string>,
    timestamp: Date.now(),
  });
  next();
});

// Mock response middleware
app.use(async (req: Request, res: Response, next: NextFunction) => {
  const mockResponse = mockServerState.getMockResponse(req.path);

  if (mockResponse) {
    if (mockResponse.delay) {
      await new Promise(resolve => setTimeout(resolve, mockResponse.delay));
    }

    if (mockResponse.headers) {
      Object.entries(mockResponse.headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
    }

    if (mockResponse.error) {
      return res.status(mockResponse.status || 500).json({
        error: mockResponse.error,
      });
    }

    if (mockResponse.data) {
      return res.status(mockResponse.status || 200).json(mockResponse.data);
    }

    // If no data or error specified, just return success
    return res.sendStatus(mockResponse.status || 200);
  }

  next();
});

// Route handlers
app.use('/api/plants', plantsRouter);
app.use('/api/journal', journalRouter);
app.use('/api/weather', weatherRouter);

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Mock server error:', err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: err.message,
    },
  });
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

export function startMockServer(port: number = 3030): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const server = app.listen(port, () => {
        console.log(`Mock server listening on port ${port}`);
        resolve();
      });

      // Handle server errors
      server.on('error', error => {
        console.error('Mock server error:', error);
        reject(error);
      });

      // Cleanup on process exit
      process.on('SIGTERM', () => {
        console.log('Shutting down mock server...');
        server.close();
      });
    } catch (error) {
      reject(error);
    }
  });
}

export default app;
