export type TestStatus = 'passed' | 'failed' | 'warning' | 'pending' | 'running';

export interface TestResult {
  id: string;
  name: string;
  status: TestStatus;
  message: string;
  details?: string;
  duration?: number;
  timestamp: string;
}

export interface TestSuite {
  name: string;
  category: string;
  tests: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  warningTests: number;
}

export interface TestReport {
  timestamp: string;
  testSuites: TestSuite[];
  summary?: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}
