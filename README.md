# simple-nodejs-workers [![Build Status](https://travis-ci.org/rksm/simple-nodejs-workers.svg?branch=master)](https://travis-ci.org/rksm/simple-nodejs-workers)

child_process.fork interface for easily multi-threading tasks in nodejs.

## Usage

```js
var workers = require('simple-nodejs-workers');

var worker = workers.startWorker(function() {
  longRunningComputation(function whenDone() {
    // do whatever you want in here, it runs in another thread.
    // NOTE! Using closed values form outside the startWorker call will not
    // work since this code is just stringified over to the worker
    process.send({computationResult: 42});
  });
});

// called once worker is started
worker.once("start", function() {
  console.log('Worker started');
});

// called once worker is done
worker.once('close', function() {
  console.log('Worker finished');
});

// will be called with msg == {computationResult: 42}
worker.on('message', function(msg) {
  console.log('Worker send:', msg);
}
```

