const util = require('util');

function LoggerError(message) {
  Error.call(this);

  Error.captureStackTrace(this, this.constructor);

  this.name = 'MyError';

  this.message = message;
}

util.inherits(LoggerError, Error);

exports = module.exports = {
  LoggerErrorFactory(){
    return new LoggerError();
  },
};
