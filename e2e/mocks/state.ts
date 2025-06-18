import { EventEmitter } from 'events';

export interface MockResponse {
  status?: number;
  delay?: number;
  data?: any;
  headers?: Record<string, string>;
  error?: {
    code: string;
    message: string;
  };
}

export interface RequestLog {
  method: string;
  path: string;
  body?: any;
  headers: Record<string, string>;
  timestamp: number;
}

export interface MockState {
  plants: Record<string, any>;
  journal: Record<string, any>;
  weather: Record<string, any>;
  userPreferences: Record<string, any>;
}

class MockServerState {
  private static instance: MockServerState;
  private routeResponses: Map<string, MockResponse>;
  private requestLogs: RequestLog[];
  private state: MockState = {
    plants: {},
    journal: {},
    weather: {},
    userPreferences: {}
  };
  public events: EventEmitter;

  private constructor() {
    this.routeResponses = new Map();
    this.requestLogs = [];
    this.events = new EventEmitter();
  }

  static getInstance(): MockServerState {
    if (!MockServerState.instance) {
      MockServerState.instance = new MockServerState();
    }
    return MockServerState.instance;
  }

  resetState() {
    this.state = {
      plants: {},
      journal: {},
      weather: {},
      userPreferences: {}
    };
    this.routeResponses.clear();
    this.requestLogs = [];
    this.events.removeAllListeners();
  }

  setMockResponse(route: string, response: MockResponse) {
    this.routeResponses.set(route, response);
  }

  getMockResponse(route: string): MockResponse | undefined {
    return this.routeResponses.get(route);
  }

  clearMockResponse(route: string) {
    this.routeResponses.delete(route);
  }

  logRequest(request: RequestLog) {
    this.requestLogs.push(request);
    this.events.emit('request', request);
  }

  getRequestLogs(): RequestLog[] {
    return [...this.requestLogs];
  }

  clearRequestLogs() {
    this.requestLogs = [];
  }

  // State management methods
  getState(): MockState {
    return { ...this.state };
  }

  updateState(key: keyof MockState, id: string, data: any) {
    this.state[key] = {
      ...this.state[key],
      [id]: data
    };
    this.events.emit('stateChange', { key, id, data });
  }

  deleteFromState(key: keyof MockState, id: string) {
    const { [id]: _, ...rest } = this.state[key];
    this.state[key] = rest;
    this.events.emit('stateChange', { key, id, deleted: true });
  }

  // Utility methods for common mock scenarios
  simulateNetworkError(route: string, code: string = 'NETWORK_ERROR') {
    this.setMockResponse(route, {
      status: 500,
      error: {
        code,
        message: `Simulated network error: ${code}`
      }
    });
  }

  simulateTimeout(route: string, delay: number = 30000) {
    this.setMockResponse(route, {
      delay
    });
  }

  simulateRateLimit(route: string) {
    this.setMockResponse(route, {
      status: 429,
      headers: {
        'Retry-After': '60'
      },
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests'
      }
    });
  }
}

export const mockServerState = MockServerState.getInstance(); 