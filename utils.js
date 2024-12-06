const db = require("./db/connection");

exports.formatData = (data) => {
  return data.map((data) => Object.values(data));
};

exports.createRef = (data, keyFn, value) => {
  return data.reduce((refObject, item) => {
    const key = keyFn(item);
    refObject[key] = item[value];
    return refObject;
  }, {});
};

exports.mapData = (data, refObj, key, value) => {
  return data.map((item) => {
    const mappedData = {
      ...item,
      [key]: refObj[item[value]],
    };
    delete mappedData[value];
    return mappedData;
  });
};

exports.customError = (sts, msg) => {
  return new Promise((resolve, reject) => {
    reject({ status: sts, customMsg: msg });
  });
};
