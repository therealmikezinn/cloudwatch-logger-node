# cloudwatch-logger-node

## Installing

```bash
npm install cloudwatch-logger-node

yarn add cloudwatch-logger-node
```


## Usage

```js
const CloudWatchLogger = require('cloudwatch-logger-node');

const logger = new CloudWatchLogger({
  aws: {
    region: 'us-east-1',
    secretAccessKey: '',
    accessKeyId: '',
  },
});

logger.add('log', {
    logStreamName: 'log',
    logGroupName: 'test',
}).add('info', {
    logStreamName: 'info',
    logGroupName: 'test',
}).add('shazam', {
    logStreamName: 'error',
    logGroupName: 'test',
}).on('error', function(err) {
  // handle error
});

logger.log("Message");

logger.info("INFO");

logger.error("error");
````
