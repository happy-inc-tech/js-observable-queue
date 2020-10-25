import Observable from "../Observable";

let observable: Observable<string>
let unsubscribe: any

describe('Observable', () => {
    test('Creates observable instance', () => {
        expect(() => {
            observable = new Observable<string>('test')
        }).not.toThrowError()
    })

    test('Adds subscriber to queue', () => {
        // @ts-ignore
        expect(observable.subscribersQueue.size).toEqual(0)
        observable.subscribe(value => true)
        // @ts-ignore
        expect(observable.subscribersQueue.size).toEqual(1)
    })

    test('Notifies on subscribing', (done) => {
        unsubscribe = observable.subscribe(value => {
            expect(value).toEqual('test')
            // @ts-ignore
            expect(observable.subscribersQueue.size).toEqual(2)
            done()
        })
    })

    test('"unsubscribe" causes reducing number of listeners', () => {
        expect(unsubscribe).toBeDefined()
        expect(() => unsubscribe()).not.toThrowError()
        // @ts-ignore
        expect(observable.subscribersQueue.size).toEqual(1)
    })
})