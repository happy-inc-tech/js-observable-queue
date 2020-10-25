import JsObservableQueue from './lib'
const { BaseTask, TaskQueue } = JsObservableQueue

const TASK_EXEC_TIME = 1000;
const AFTER_EACH_DELAY_TIME = 500;

class MyTask extends BaseTask<string | number> {
  executor = () => {
    this.executionResult = (this.id as string).split('').reverse().join('');
    return new Promise<string | number>((resolve) => {
      setTimeout(() => resolve('Result: ' + this.executionResult), TASK_EXEC_TIME);
    });
  };
}

async function main() {
  const queue = new TaskQueue();
  queue.addTask(new MyTask({ id: 'lyohaplotinka' }, false));
  queue.addTask(new MyTask({}, true));
  queue.addTask(new MyTask({}, true));
  queue.addTask(new MyTask({ id: 'js-queue' }));
  queue.addTask(new MyTask({}, true));
  queue.addTask(new MyTask({}, true));
  queue.addTask(new MyTask({}, true));
  queue.addTask(new MyTask({}, true));

  queue.beforeAll((queue1) => {
    console.log(':: Total tasks:', queue1.tasksCount);
  });

  queue.beforeEach((queueElement) => {
    console.log('\nStarting task:', queueElement.id);
  });

  queue.afterEach((queueElement) => {
    console.log('Finished task:', queueElement.id, ':: Value:', queueElement.executionResult);
    return new Promise((resolve) => {
      setTimeout(() => resolve(), AFTER_EACH_DELAY_TIME);
    });
  });

  queue.afterAll(() => {
    console.log(':: No more elements in queue!\n');
  });

  queue.run();

  queue.tasksFinishedPromise.then(() => console.log(':: Queue stopped'));

  setTimeout(() => {
    queue.addTask(new MyTask({}, true));
    setTimeout(() => {
      queue.stop();
    }, TASK_EXEC_TIME * 1.2 + AFTER_EACH_DELAY_TIME * 1.2);
  }, TASK_EXEC_TIME * 10 + AFTER_EACH_DELAY_TIME * 10);
}

main();
