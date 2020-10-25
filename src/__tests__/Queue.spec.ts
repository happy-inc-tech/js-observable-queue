import TaskQueue from '../Queue';
import TestTask from './mocks/TestTask';

let queue: TaskQueue;

describe('Queue', () => {
  test('Creates class instance', () => {
    expect(() => {
      queue = new TaskQueue();
    }).not.toThrowError();
  });

  test('Status is "stopped" after creation', () => {
    expect(queue.currentStatus).toEqual('stopped');
  });

  test('Does not launch queue if status is stopped and task are added', () => {
    queue.addTask(new TestTask({}, true));
    queue.addTask(new TestTask({}, true));
    expect(queue.currentStatus).toEqual('stopped');
  });

  test('Adds tasks correctly', () => {
    expect(queue.tasksCount).toEqual(2);
  });

  test('Runs  tasks correctly, after hooks are called correctly', (done) => {
    let count = 0;
    queue.afterEach((queueElement) => {
      count++;
      expect(queueElement.executionResult).toEqual('TESTED WELL');
      expect(queue.tasksCount).toEqual(2 - count);
    });
    queue.afterAll((queue1) => {
      done();
    });
    queue.run();
  });

  test('After tasks are finished, status is "waiting"', () => {
    expect(queue.currentStatus).toEqual('waiting');
  });

  test('"Stop" method changes status to "stopped"', () => {
    queue.stop();
    expect(queue.currentStatus).toEqual('stopped');
  });

  test('Callback for running out of tasks works correctly', (done) => {
    queue.addTask(new TestTask({ isPromise: true }, true));
    expect(queue.currentStatus).toEqual('stopped');
    queue.afterEach(() => {});
    queue.afterAll(() => {});
    const unsubscribe = queue.tasksFinished((finishStatus) => {
      expect(finishStatus).toEqual('waiting');
      queue.stop();
      unsubscribe();
      done();
    });
    queue.run();
  });

  test('Promise for running out of tasks works correctly', (done) => {
    queue.addTask(new TestTask({ isPromise: true }, true));
    expect(queue.currentStatus).toEqual('stopped');
    queue.tasksFinishedPromise.then((value) => {
      expect(value).toEqual('waiting');
      queue.stop();
      done();
    });
    queue.run();
  });

  test('Does not changes status to "error" if task finished with error and stopOnError === false', (done) => {
    queue.addTask(new TestTask({ isPromise: true, throwError: true }, true));
    queue.afterEach((queueElement) => {
      expect(queueElement.currentStatus).toEqual('error');
    });
    queue.tasksFinishedPromise.then((value) => {
      expect(value).toEqual('waiting');
      queue.stop();
      done();
    });
    queue.run();
  });

  test('Changes status to "error" if task finished with error and stopOnError === true', (done) => {
    queue = new TaskQueue(true);
    queue.addTask(new TestTask({ isPromise: true, throwError: true }, true));
    queue.tasksFinishedPromise.catch((reason) => {
      expect(reason).toEqual('error');
      expect(queue.currentStatus).toEqual('error');
      queue.stop();
      done();
    });
    queue.run();
  });

  test('beforeEach and beforeAll hooks are working correctly; order of tasks is correct', (done) => {
    const ids = ['id1', 'id2', 'id3'];
    let iterations = 0;
    ids.forEach((id) => queue.addTask(new TestTask({ isPromise: false, id })));
    queue.beforeAll((queue1) => {
      expect(queue1.tasksCount).toEqual(3);
    });
    queue.beforeEach((queueElement) => {
      expect(queueElement.id).toEqual(ids[iterations]);
      iterations++;
    });
    queue.afterAll(() => {
      queue.stop();
      done();
    });
    queue.run();
  });

  test('getTaskPosition method returns correct value', () => {
    const ids = ['id1', 'id2', 'id3'];
    ids.forEach((id) => queue.addTask(new TestTask({ isPromise: false, id })));
    const position = queue.getTaskPosition('id2');
    expect(position).toEqual(1);
  });
});
