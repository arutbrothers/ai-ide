export interface ImplementationPlan {
    overview: string;
    researchPhase: string;
    implementationSteps: string[];
    verificationPlan: string;
    risksAndMitigations: string;
    humanReviewPoints: string[];
}

export interface Task {
    id: string;
    description: string;
    status: 'completed' | 'in_progress' | 'pending';
    duration?: string;
    findings?: string;
    commands?: string[];
    files?: string[];
    completion?: number;
}

export interface TaskList {
    tasks: Task[];
}

export interface Screenshot {
    path: string;
    timestamp: string;
    pageUrl: string;
    viewportSize: {
        width: number;
        height: number;
    };
    annotations?: any[];
}

export interface WalkthroughRecording {
    path: string;
    duration: number; // in seconds
    narration?: string;
}

export interface CodeDiff {
    file: string;
    diff: string;
    agentComment?: string;
    rationale?: string;
}

export interface TestResult {
    name: string;
    status: 'passed' | 'failed' | 'skipped';
    duration: number; // in milliseconds
}

export interface TestResults {
    testSuite: string;
    timestamp: string;
    results: {
        passed: number;
        failed: number;
        skipped: number;
    };
    tests: TestResult[];
    coverage?: {
        lines: number;
        functions: number;
        branches: number;
    };
}
