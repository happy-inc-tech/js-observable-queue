import BaseTask from "../BaseTask";
import TestTask from "./mocks/TestTask";

jest.useFakeTimers()


let testTask: TestTask

describe('BaseTask spec', () => {
    test('Should throw error if no ID provided', () => {
        expect(() => {
            const task = new BaseTask({})
        }).toThrowError()
    })

    test('Should throw error if no executor provided', () => {
        expect.assertions(2)
        const task = new BaseTask({ id: 'test' })
        expect(setTimeout).toHaveBeenCalledTimes(1)
        try {
            jest.runAllTimers()
        } catch (e) {
            expect(e.message).toEqual('No executor for task provided')
        }
    })

    test('Generates id if this option provided', () => {
        const task = new TestTask({}, true)
        expect(task.id).toBeDefined()
    })


    test('Creates new task with ID and status "queued"', () => {
        testTask = new TestTask({ id: 'testTaskId', isPromise: true })
        expect(testTask.id).toEqual('testTaskId')
        expect(testTask.currentStatus).toEqual('queued')
    })

    test('Runs task correctly and sets status to "working"', () => {
        testTask.run()
        expect(testTask.currentStatus).toEqual('working')
    })

    test('Correctly notifies user via "ready" subscribe policy', (done) => {
        testTask.ready(status => {
            expect(status).toEqual('finished')
            done()
        })
        jest.runAllTimers()
    })

    test('Correctly notifies use via "readyPromise" async policy', async () => {
        testTask.run()
        const statusPromise = testTask.readyPromise
        jest.runAllTimers()
        const status = await statusPromise
        expect(status).toEqual('finished')
    })

    test('Returns error status if error occurred (subscribe policy)', (done) => {
        testTask = new TestTask({ throwError: true, isPromise: true }, true)
        jest.runAllTimers()
        testTask.run()
        testTask.ready(status => {
            expect(status).toEqual('error')
            done()
        })
        jest.runAllTimers()
    })

    test('Rejects the promise if error occurred (async policy)',  (done) => {
        testTask.run()
        testTask.readyPromise
            .catch(err => {
                expect(err).toEqual('error')
                done()
            })
        jest.runAllTimers()
    })

    test('Non-promise executor is okay', (done) => {
        testTask = new TestTask({ throwError: false, isPromise: false }, true)
        testTask.run()
        testTask.ready(status => {
            expect(status).toEqual('finished')
            done()
        })
        jest.runAllTimers()
    })

    test('Non-promise executor with error is okay', (done) => {
        testTask = new TestTask({ throwError: true, isPromise: false }, true)
        testTask.run()
        testTask.ready(status => {
            expect(status).toEqual('error')
            done()
        })
        jest.runAllTimers()
    })
})