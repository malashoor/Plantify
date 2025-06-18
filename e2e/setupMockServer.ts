import { startMockServer } from './mocks/mockServer';
import { mockServerState } from './mocks/state';

const MOCK_SERVER_PORT = 3030;

export async function setupMockServer(): Promise<void> {
  try {
    // Start mock server
    await startMockServer(MOCK_SERVER_PORT);

    // Set initial state
    mockServerState.resetState();

    // Seed some test data
    mockServerState.updateState('weather', 'current', {
      temperature: 22,
      humidity: 65,
      condition: 'sunny',
      timestamp: new Date().toISOString()
    });

    mockServerState.updateState('weather', 'forecast', {
      daily: [
        {
          date: new Date(Date.now() + 86400000).toISOString(),
          temperature: { min: 18, max: 25 },
          condition: 'partly_cloudy'
        },
        {
          date: new Date(Date.now() + 172800000).toISOString(),
          temperature: { min: 17, max: 23 },
          condition: 'rain'
        }
      ],
      timestamp: new Date().toISOString()
    });

    console.log('Mock server setup complete');
  } catch (error) {
    console.error('Failed to setup mock server:', error);
    throw error;
  }
}

export async function teardownMockServer(): Promise<void> {
  // Any cleanup needed
  mockServerState.resetState();
}

// If running this file directly
if (require.main === module) {
  setupMockServer().catch(console.error);
} 