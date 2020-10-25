import { ObservableListener } from '../types';
import { generateId } from '../utils';

export default class Observable<T> {
  private subscribersQueue = new Map();

  constructor(private _value: T) {}

  get getValue(): T {
    return this._value;
  }

  public subscribe(listener: ObservableListener<T>): () => void {
    const id = generateId();
    this.subscribersQueue.set(id, listener);
    listener(this.getValue);
    return () => {
      this.subscribersQueue.delete(id);
    };
  }

  public setValue(newValue: T): void {
    this._value = newValue;
    const allListeners = this.subscribersQueue.values();
    for (const subscriber of allListeners) {
      subscriber(this._value);
    }
  }
}
