import { TaskData, TaskExecutor, TaskStatus } from '../types';
import { generateId } from '../utils';
import Observable from '../Observable';

export default class BaseTask<T> {
  protected executor: TaskExecutor<T>;
  protected status: Observable<TaskStatus> = new Observable('queued');

  public readonly id: string | number;
  public executionResult: T;

  constructor(protected readonly data: TaskData, shouldGenerateId = false) {
    if (shouldGenerateId) {
      this.id = generateId();
    } else {
      if (!data.id) throw new ReferenceError('Task ID is not provided in "data"');
      this.id = data.id;
    }

    setTimeout(() => {
      if (!this.executor) throw new ReferenceError('No executor for task provided');
    }, 0);
  }

  public ready = (callback: (finishStatus: TaskStatus) => void): (() => void) => {
    return this.status.subscribe((status) => {
      if (status === 'finished' || status === 'error') {
        callback(status);
      }
    });
  };

  get readyPromise(): Promise<TaskStatus> {
    return new Promise((resolve, reject) => {
      this.ready((status) => {
        if (status === 'finished') {
          resolve(status);
        } else if (status === 'error') {
          reject(status);
        }
      });
    });
  }

  public run(): void {
    if (this.status.getValue === 'working') return;
    this.status.setValue('working');
    try {
      const result = this.executor();
      const isPromise = (result as any).then !== undefined
      if (isPromise) {
        (result as Promise<T>)
          .then((value) => {
            this.executionResult = value;
            this.status.setValue('finished');
          })
          .catch((e) => {
            this.status.setValue('error')
          });
      } else {
        this.executionResult = result as T;
        this.status.setValue('finished');
      }
    } catch (e) {
      this.status.setValue('error');
    }
  }

  get currentStatus(): TaskStatus {
    return this.status.getValue;
  }
}
