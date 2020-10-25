# js-observable-queue

**Zero-dependency non-blocking task queue for Node.js and Browser**

![](https://lyoha.info/assets/img/js-observable-queue.gif)

1. [Getting started](#getting-started)
2. [BaseTask constructor parameters](#basetask-constructor-parameters)
3. [Creating a Queue and adding tasks](#creating-a-queue-and-adding-tasks)
4. [Completion Actions](#completion-actions)
    1. [Subscription to change status to "pending" or "error"](#i-subscription-to-change-status-to-pending-or-error)
    2. [Waiting for the promise property to be fulfilled (asynchronous way)](#ii-waiting-for-the-promise-property-to-be-fulfilled-asynchronous-way)
5. [Deep dive in](#deep-dive-in)
    1. [Task status and execution result](#task-status-and-execution-result)
    2. [Getting task and queue status](#getting-task-and-queue-status)
    3. [Queue hooks](#queue-hooks)
    4. [Task position in the queue, number of tasks, stop queue](#task-position-in-the-queue-number-of-tasks-stop-queue)
    5. [Adding tasks to the queue after the added tasks have finished](#adding-tasks-to-the-queue-after-the-added-tasks-have-finished)

*Please read the file ["example.ts"](example.ts) for a real example of 
using a queue.*

### Getting started

```
npm install js-observable-queue
```

Import the installed package. The top-level object 
contains `BaseTask` and `TaskQueue` classes,  you 
can initialize variables for them in any convenient way:

```typescript
import JsObservableQueue from 'js-observable-queue'
const { BaseTask, TaskQueue } = JsObservableQueue
```

Next, create a task class that extends `BaseTask`. 
It must have an "executor" property. It can be 
a synchronous or asynchronous function, of your choice.

`BaseTask` is a generic class, pass the type you expect after 
the task is done (if you are using TS)

```typescript
class MyTask extends BaseTask<string> {
  executor = () => {
    const reversedId = (this.id as string).split('').reverse().join('');
    return new Promise<string | number>((resolve) => {
      setTimeout(() => resolve('Result: ' + reversedId), 1000);
    });
  };
}
```

### BaseTask constructor parameters

There may be other methods and properties in your class that you 
need to work with. The constructor takes two parameters:

1. `data: TaskData` -  object with any data you need. Any types. 
2. `shouldGenerateId: boolean` - should `BaseTask` generate unique task ID or not.

Each task in your queue **must** have an 
ID. You can pass it in a data object, or you can pass "true" in 
the second argument to the constructor. BT will generate a unique 
identifier and assign it to the task. You can always find out the 
task ID by calling `YourTaskClass.id` (read-only) 

### Creating a Queue and adding tasks

The configuration is complete. Next, you need to create an 
instance of the `TaskQueue`, you can pass the "stopOnError" 
parameter to the constructor (by default, "false"). This way, 
you can control the behavior of the queue in case one of the 
tasks completed with an error. 

If you pass "true", then in case 
of an error in the task, the queue will stop executing and 
end with the "error" status, otherwise it will ignore the error 
and continue execution.

```typescript
const queue = new TaskQueue(false);
```

Now you can add tasks to the queue. The queue is created with 
the "stopped" status, so when adding tasks immediately after 
creation, execution will not start.

```typescript
queue.addTask(new MyTask({ id: 'lyohaplotinka' }, false));
queue.addTask(new MyTask({}, true));
```

You can start the queue by calling the "run" method:

```typescript
queue.run()
```

### Completion Actions

When the tasks in the queue are finished, it will switch to the 
"waiting" status. There are two ways to find out when the tasks 
are over.

##### I. Subscription to change status to "pending" or "error"
To do this, there is a `taskFinished` method in the queue, to which 
you need to pass a callback function as the only argument. The 
callback argument will be passed the status with which the queue 
completed its work:

```typescript
queue.tasksFinished(status => {
    console.log(status) // "waiting" or "error"
})
```

##### II. Waiting for the promise property to be fulfilled (asynchronous way)
This option is similar to the previous one, however, it uses 
JavaScript promises (or async-await syntax). As a result of the 
fulfillment of the promise, the status of the completion of the 
queue will also be transmitted:

```typescript
const status = await queue.tasksFinishedPromise
console.log(status) // "waiting" or "error"
```

## Deep dive in

### Task status and execution result
The value returned by the "worker" property in the task will be 
available in the "executionResult" property:

```typescript
// ...
executor = () => {
    return 'I am complete!'
};
// ...

console.log(task.executionResult) // 'I am complete!'
```

Like a queue, a task has a status that you can track. 
The difference is in the name of the methods and the final 
status: instead of "taskFinished" use "ready", instead of 
"waiting" there will be "finished":

```typescript
// Subscribe-way:
task.ready(status => {
    console.log(status) // "finished" or "error"
})

// Promise-way:
const status = await task.readyPromise
console.log(status) // "finished" or "error"
```

### Getting task and queue status
The task status is always available through the 
"CurrentStatus" getter. The same works for the queue.

```typescript
const taskStatus = task.currentStatus // working
const queueStatus = queue.currentStatus // working
```

### Queue hooks
You can use four queue hooks: two global (beforeAll, afterAll) and 
two local (beforeEach, afterEach). As the name implies, the first 
two are called before and after starting all tasks in the queue, 
respectively.

The second two are called before each task and after each task, 
respectively.

The first two return an instance of the queue itself to the 
callback, the second - the task with which the work will occur 
(or has occurred).

In hooks, you can perform any operations, including asynchronous ones.

```typescript
queue.beforeAll((queue1) => {
    console.log(':: Total tasks:', queue1.tasksCount);
});

queue.beforeEach((queueElement) => {
    console.log('Starting task:', queueElement.id);
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
```

### Task position in the queue, number of tasks, stop queue

Knowing the task ID, you can find out its position in the queue. 
This can be useful if you need to track progress:

```typescript
queue.getTaskPosition('taskId') // f.e. 3
```

You can also get the number of tasks remaining in the queue:
```typescript
queue.tasksCount // f.e. 7
```

To stop execution, use the stop method:
```typescript
queue.stop()
```
To start the queue again, use the "run" method.

### Adding tasks to the queue after the added tasks have finished
When the tasks in the queue are finished, it goes into the "waiting" 
status. This means that the queue is not stopped, and if you add a 
task to it now, its execution will start immediately.

If this behavior does not suit you, we recommend that you call 
the "stop" method in the subscription to status change or the 
"afterAll" hook.