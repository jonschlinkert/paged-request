'use strict';

const axios = require('axios');

module.exports = async function(url, options, next) {
  if (typeof url !== 'string') {
    return Promise.reject(new TypeError('expected "url" to be a string'));
  }

  if (typeof options === 'function') {
    next = options;
    options = null;
  }

  let opts = Object.assign({}, options);
  const acc = { orig: url, options, pages: [], urls: [] };
  let res;

  while (url && typeof url === 'string' && !acc.urls.includes(url)) {
    acc.urls.push(url);
    res = await axios.get(url, opts);
    const result = await next(url, res, acc);
    if (result) {
      url = result.nextUrl
      opts = result.nextOptions
    } else {
      url = null
    }
    acc.pages.push(res);
  }

  return acc;
};
