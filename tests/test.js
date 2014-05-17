var expect = require("expect.js");
var workers = require('../index');

beforeEach(function(done) {
  done(null);
});

afterEach(function(done) {
  done(null);
});

describe('workers', function() {

  it('startup and change state', function(done) {
    var worker = workers.startWorker(function() {}),
        states = [];

    states.push(worker.state);

    worker.once("start", function() { states.push(worker.state); });

    worker.once('close', function() {
      states.push(worker.state);
      expect(states).to.eql(['starting', 'start', 'close']);
      done();
    });

  });

  it('can do stuff', function(done) {
    var worker = workers.startWorker(function() { process.send({stuff: 2 + 3})}),
        msg;

    worker.once('message', function(m) { msg = m; });

    worker.once('close', function() {
      expect(msg).to.eql({stuff: 5});
      done();
    });

  });

});
