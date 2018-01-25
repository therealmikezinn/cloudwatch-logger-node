const AWS = require('aws-sdk');

const EventEmitter = require('events');

const Logger = require('./logger');

class LogContainer extends EventEmitter {
  constructor(params) {
    super();

    const self = this;

    const {aws} = params;

    self.cloudwatch = new AWS.CloudWatchLogs(aws);
  }

  add(level, options) {
    const self = this;

    self[level] = new Logger(options, self).log;

    return self;
  }
}

exports = module.exports = LogContainer;
