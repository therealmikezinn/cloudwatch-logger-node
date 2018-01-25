const typeChecker = require('js-type-checker');

const MAX_RETRIES = 10;

class Logger {
  constructor(options, context) {
    const self = this;

    self.options = options;

    self.context = context;

    self.token = null;

    self.log = self.log.bind(self);
  }

  createLogGroup() {
    const self = this;

    const resolver = (resolve, reject) => (err, result) => {
      if (err) {
        return reject(err);
      }

      return resolve(result);
    };

    const params = {
      logGroupName: self.options.logGroupName,
    };

    return new Promise((resolve, reject) => {
      self.context.cloudwatch.createLogGroup(params, resolver(resolve, reject));
    });
  }

  createLogStream() {
    const self = this;

    const resolver = (resolve, reject) => (err, result) => {
      if (err) {
        return reject(err);
      }

      return resolve(result);
    };

    const params = {
      logStreamName: self.options.logStreamName,
      logGroupName: self.options.logGroupName,
    };

    return new Promise((resolve, reject) => {
      self.context.cloudwatch.createLogStream(params, resolver(resolve, reject));
    });
  }

  getLogGroup() {
    const self = this;

    const resolver = (resolve, reject) => (err, result) => {
      if (err) {
        return reject(err);
      }

      const hasGroup = result.logGroups.filter((currentGroup) => {
        return currentGroup.logGroupName === self.options.logGroupName;
      });

      return resolve(
        hasGroup.length > 0
      );
    };

    const params = {
      logGroupNamePrefix: self.options.logGroupName,
    };

    return new Promise((resolve, reject) => {
      self.context.cloudwatch.describeLogGroups(params, resolver(resolve, reject));
    });
  }

  getStream() {
    const self = this;

    const resolver = (resolve, reject) => (err, result) => {
      if (err) {
        return reject(err);
      }

      const [hasGroup] = result.logStreams.filter((currentGroup) => {
        return currentGroup.logStreamName === self.options.logStreamName;
      });

      if (!typeChecker.isUndefined(hasGroup) && !typeChecker.isUndefined(hasGroup.uploadSequenceToken)) {
        self.token = hasGroup.uploadSequenceToken;
      }

      return resolve(
        !typeChecker.isUndefined(hasGroup)
      );

    };

    const params = {
      logGroupName: self.options.logGroupName,
      logStreamNamePrefix: self.options.logStreamName
    };

    return new Promise((resolve, reject) => {
      self.context.cloudwatch.describeLogStreams(params, resolver(resolve, reject));
    });
  }

  getToken() {
    const self = this;

    if (self.token !== null) {
      return Promise.resolve(self.token);
    }

    return self.getLogGroup().then((result) => {
      if (result === true) {
        return Promise.resolve();
      }

      return self.createLogGroup();
    }).then(() => {
      return self.getStream();
    }).then((result) => {
      if (result === true) {
        return Promise.resolve();
      }

      return self.createLogStream();
    });
  }

  log(...messages) {
    const self = this;

    const logEvents = messages.map(m => {
      return {
        message: JSON.stringify(m),
        timestamp: Date.now()
      }
    });

    self.getToken().then((token) => {
      return self.putLogEvents(logEvents);
    }).then((result) => {
      self.context.emit('success', result);
    }).catch((err) => {
      if (err.code === 'DataAlreadyAcceptedException' || err.code === 'InvalidSequenceTokenException') {
        self.retry(logEvents, MAX_RETRIES);
      } else {
        self.context.emit('error', err);
      }
    });
  }

  putLogEvents(logEvents) {
    const self = this;

    const streamParams = {
      logEvents,
      sequenceToken: self.token,
      logStreamName: self.options.logStreamName,
      logGroupName: self.options.logGroupName
    };

    const responseHandler = (resolve, reject) => (err, data) => {
      if (err) {
        reject(err);
      } else {
        self.token = data.nextSequenceToken;
        resolve(data);
      }
    };

    return new Promise((resolve, reject) => {
      self.context.cloudwatch.putLogEvents(streamParams, responseHandler(resolve, reject));
    });
  }

  retry(logEvents, count) {
    const self = this;

    if (count === 0) {
      return;
    }

    self.putLogEvents(logEvents).then((result) => {
      self.context.emit('success', result);
    }).catch((err) => {
      self.retry(logEvents, count--);
    });
  }
}

exports = module.exports = Logger;
