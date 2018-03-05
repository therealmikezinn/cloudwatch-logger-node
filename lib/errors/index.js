const util = require('util');

function LoggerError(err, parent) {
  Error.call(this);
  this.err = err;
  this.code = err.code;
  this.name = 'LoggerError';
  this.parent =  parent;
}

util.inherits(LoggerError, Error);

exports = module.exports = {
  LoggerErrorFactory(err, parent){
    return new LoggerError(err, parent);
  },
};
