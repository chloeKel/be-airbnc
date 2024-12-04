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

exports.validateColumns = (key, input) => {
  const validColumns = {
    sort: ["favourite_count", "price_per_night"],
    order: ["asc", "desc"],
  };

  if (validColumns[key].includes(input)) {
    return true;
  } else {
    return Promise.reject({ status: 400, customMsg: "Invalid sorting criteria" });
  }
};
