import { ObservableListener } from '../types';
export default class Observable<T> {
    private _value;
    private subscribersQueue;
    constructor(_value: T);
    get getValue(): T;
    subscribe(listener: ObservableListener<T>): () => void;
    setValue(newValue: T): void;
}
