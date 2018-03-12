const typeChecker = require('js-type-checker');

const reduceMSG = (msgs) => {
  return msgs.reduce((accumulator, cur) => {
    if(typeChecker.isArray(cur) || typeChecker.isObject(cur)){
      return accumulator + ` ${JSON.stringify(cur)}`;
    } else {
      return accumulator + ` ${cur}`;
    }
  }, '').trimLeft();
};

const defaultFormatter = msg => reduceMSG(msg);

module.exports = {
  defaultFormatter,
  reduceMSG,
};
