/* eslint @typescript-eslint/no-explicit-any: 'off' */
import TaskQueue from './Queue';

export interface TaskData {
  id?: string | number;
  [key: string]: any;
}

export type TaskExecutor<T> = () => T | Promise<T>;

export type TaskStatus = 'queued' | 'working' | 'finished' | 'error' | 'cancel';

export type QueueStatus = 'stopped' | 'waiting' | 'running' | 'error';

export type ExecutableTask = {
  id: string | number;
  executor: TaskExecutor<any>;
  executionResult: any;
  currentStatus: TaskStatus;
  [key: string]: any;
};

export type ObservableListener<T> = (value: T) => void;

export type EachHook = (queueElement: ExecutableTask) => void | Promise<void>;

export type AllHook = (queue: TaskQueue) => void | Promise<void>;

export type FulfilledPromise = {
  [key: string]: any;
  then: (value?: any) => void;
};
