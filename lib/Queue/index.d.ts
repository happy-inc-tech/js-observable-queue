import { AllHook, EachHook, ExecutableTask, QueueStatus } from '../types';
export default class TaskQueue {
    private readonly stopOnError;
    private status;
    private queue;
    private beforeEachHook;
    private afterEachHook;
    private beforeAllHook;
    private afterAllHook;
    constructor(stopOnError?: boolean);
    run(): Promise<void>;
    private runTask;
    tasksFinished: (callback: (finishStatus: QueueStatus) => void) => (() => void);
    get tasksFinishedPromise(): Promise<QueueStatus>;
    stop(): void;
    addTask(task: ExecutableTask): void;
    getTaskPosition(taskId: string | number): number;
    beforeEach(callback: EachHook): void;
    afterEach(callback: EachHook): void;
    beforeAll(callback: AllHook): void;
    afterAll(callback: AllHook): void;
    get tasksCount(): number;
    get currentStatus(): QueueStatus;
}
