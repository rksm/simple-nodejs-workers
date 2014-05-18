# simple-nodejs-workers [![Build Status](https://travis-ci.org/rksm/simple-nodejs-workers.svg?branch=master)](https://travis-ci.org/rksm/simple-nodejs-workers)

child_process.fork interface for easily multi-threading tasks in nodejs.

## Usage

```js
var workers = require('simple-nodejs-workers');

var worker = workers.startWorker(function() {
  longRunningComputation(function whenDone() {
    /* ... ... */
    process.send({computationResult: 42});
  });
});

states.push(worker.state);

worker.once("start", function() {
  console.log('Worker started');
});

worker.once('close', function() {
  console.log('Worker finished');
});

worker.on('message', function(msg) {
  console.log('Worker send:', msg);
}
```

