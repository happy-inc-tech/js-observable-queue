import { TaskData, TaskExecutor, TaskStatus } from '../types';
import Observable from '../Observable';
export default class BaseTask<T> {
    protected readonly data: TaskData;
    protected executor: TaskExecutor<T>;
    protected status: Observable<TaskStatus>;
    readonly id: string | number;
    executionResult: T;
    constructor(data: TaskData, shouldGenerateId?: boolean);
    ready: (callback: (finishStatus: TaskStatus) => void) => (() => void);
    get readyPromise(): Promise<TaskStatus>;
    run(): void;
    get currentStatus(): TaskStatus;
}
