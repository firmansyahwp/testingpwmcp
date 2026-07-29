// Represents execution result of one test case.

export interface ExecutionResult {

  // Test Case ID
  testcaseId: string;

  // Test Case Name
  testcaseName: string;

  // Overall status
  status: "PASSED" | "FAILED" | "SKIPPED";

  // Execution start time.
  startedAt: Date;

  // Execution finish time.
  finishedAt: Date;

  // Total duration in milliseconds.
  duration: number;

  // Number of successful steps.
  passedSteps: number;

  // Number of failed steps.
  failedSteps: number;

  // Error or message if execution failed.
  errorMessage?: string;

  // Screenshot path if available.
  screenshot?: string;

  // Execution logs
  logs: string[];

}