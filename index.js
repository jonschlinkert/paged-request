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

  const opts = Object.assign({}, options);
  const acc = { url, options, pages: [], urls: [] };
  let prev;
  let res;

  while (url && typeof url === 'string' && prev !== url) {
    prev = url;
    acc.urls.push(url);
    res = await axios.get(url, opts);
    res.body = res.data; //<= backwards compatibility with 1.0
    url = await next(url, res, acc);
    acc.pages.push(res);
  }

  return acc;
};
