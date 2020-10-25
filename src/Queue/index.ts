import Observable from '../Observable';
import { AllHook, EachHook, ExecutableTask, QueueStatus, TaskStatus } from '../types';

export default class TaskQueue {
  private status: Observable<QueueStatus> = new Observable('stopped');
  private queue = new Map();
  private beforeEachHook: EachHook;
  private afterEachHook: EachHook;
  private beforeAllHook: AllHook;
  private afterAllHook: AllHook;

  constructor(private readonly stopOnError = false) {}

  public async run(): Promise<void> {
    if (this.currentStatus === 'running') return;
    this.status.setValue('running');
    this.beforeAllHook && (await this.beforeAllHook(this));
    this.runTask();
  }

  private async runTask() {
    if (this.currentStatus === 'stopped' || this.currentStatus === 'waiting' || this.currentStatus === 'error') return;
    if (!this.queue.size) {
      this.status.setValue('waiting');
      this.afterAllHook && (await this.afterAllHook(this));
      return;
    }
    const [key, value] = this.queue.entries().next().value;
    this.beforeEachHook && (await this.beforeEachHook(value));
    value.run();
    value.ready(async (status: TaskStatus) => {
      if (status === 'error' && this.stopOnError) {
        this.status.setValue('error');
        this.queue.delete(key);
        return;
      }
      this.queue.delete(key);
      this.afterEachHook && (await this.afterEachHook(value));
      return this.runTask();
    });
  }

  public tasksFinished = (callback: (finishStatus: QueueStatus) => void): (() => void) => {
    return this.status.subscribe((status) => {
      if (status === 'waiting' || status === 'error') {
        callback(status);
      }
    });
  };

  get tasksFinishedPromise(): Promise<QueueStatus> {
    return new Promise((resolve, reject) => {
      this.tasksFinished((status) => {
        if (status === 'waiting') {
          resolve(status);
        } else if (status === 'error') {
          reject(status);
        }
      });
    });
  }

  public stop(): void {
    this.status.setValue('stopped');
  }

  public addTask(task: ExecutableTask): void {
    if (this.queue.has(task.id)) return;
    this.queue.set(task.id, task);
    if (this.currentStatus === 'waiting') this.run();
  }

  public getTaskPosition(taskId: string | number): number {
    const keyArray = [...this.queue.keys()];
    return keyArray.findIndex((key) => key === taskId);
  }

  public beforeEach(callback: EachHook): void {
    this.beforeEachHook = callback;
  }

  public afterEach(callback: EachHook): void {
    this.afterEachHook = callback;
  }

  public beforeAll(callback: AllHook): void {
    this.beforeAllHook = callback;
  }

  public afterAll(callback: AllHook): void {
    this.afterAllHook = callback;
  }

  get tasksCount(): number {
    return this.queue.size;
  }

  get currentStatus(): QueueStatus {
    return this.status.getValue;
  }
}
