import TaskQueue from './Queue';
export interface TaskData {
    [key: string]: any;
}
export declare type TaskExecutor<T> = () => T | Promise<T>;
export declare type TaskStatus = 'queued' | 'working' | 'finished' | 'error' | 'cancel';
export declare type QueueStatus = 'stopped' | 'waiting' | 'running' | 'error';
export declare type ExecutableTask = {
    id: string | number;
    executor: TaskExecutor<any>;
    executionResult: any;
    currentStatus: TaskStatus;
    [key: string]: any;
};
export declare type ObservableListener<T> = (value: T) => void;
export declare type EachHook = (queueElement: ExecutableTask) => void | Promise<void>;
export declare type AllHook = (queue: TaskQueue) => void | Promise<void>;
