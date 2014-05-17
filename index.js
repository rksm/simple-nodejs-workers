var fs = require("fs");
var util = require("util");

var fork = require("child_process").fork;
var EventEmitter = require("events").EventEmitter;


function startWorker(workerFunc, options) {

  options = options || {
      debug: false
  }

  var worker = {
      state: 'not started',
      proc: null,
      options: options,
      stop: stop
  }

  util._extend(worker, EventEmitter.prototype);
  EventEmitter.call(worker);

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

  function log(/*args*/) {
    if (options.debug) {
      var args = Array.prototype.slice.call(arguments);
      var string = '[Worker %s] ' + args.shift();
      var id = proc ? proc.pid : '???';
      console.log.apply(console, [string, id].concat(args));
    }
  }

  function stateChange(state) {
    log('%s -> %s', worker.state, state);
    worker.state = state;
    worker.emit('state', state);
    if (state === 'start') worker.emit('start');
    if (state === 'close') worker.emit('close');
  }

  function stop() {
    if (proc && worker.state !== 'close') {
        proc.kill('SIGTERM');
    }
  }

  function workerControlCode(workerFunc) {
    process.send({workerState: 'start'});
    try {
      workerFunc.call(null);
    } catch(e) {
      process.send({error: e});
    }
  }

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

  var workerFn = './lively-nodejs-worker.js';
  var code = util.format(
    "(%s)(%s)",
    workerControlCode,
    workerFunc || function() {});

  log('[worker setup] 1. writing out worker code');
  fs.writeFileSync(workerFn, code);

  log('[worker setup] 2. starting worker');
  var proc = fork(workerFn, [], {silent: true});

  stateChange('starting');

  setTimeout(function() {
    worker.once('start', function() {
      log('[worker setup] 3. removing worker code');
      fs.unlinkSync(workerFn);
    });
  }, 10);

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

  if (options.debug) proc.stdout.pipe(process.stdout);

  proc.on('message', function(m) {
    if (m.workerState) stateChange(m.workerState);
    else if (m.log) log('worker log: ', m.log);
    else if (m.error) { log('worker error: ', m); worker.emit('error', m); }
    else worker.emit('message', m);
  });
  
  proc.on('close', function() {
    stateChange('close');
    worker.stoppedProc = proc;
    worker.proc = proc = null;
  });

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

  return worker;
}

module.exports = {
startWorker: startWorker
}
