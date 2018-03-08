const AWS = require('aws-sdk');

const EventEmitter = require('events');

const Logger = require('./logger');

class LogContainer extends EventEmitter {
  constructor(params) {
    super();

    const self = this;

    const { aws } = params;

    self.cloudwatch = new AWS.CloudWatchLogs(aws);

    self.transports = {};

    self.queue = [];

    self.timer = setInterval(function(){
      if (self.queue.length > 0) {
        const currentLog = self.queue.shift();
        currentLog();
      }
    }, 100);
  }

  add(level, options) {
    const self = this;

    self[level] = (function(ctx){
      const log = new Logger(options, ctx).log;

      return function(msg){
        ctx.queue.push(function(){
          log(msg);
        });
      }
    })(self);

    return self;
  }

  exportLogs() {
    const self = this;

    return self.transports;
  }
}

module.exports = LogContainer;
