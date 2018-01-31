'use strict';

const needle = require('needle');

module.exports = async function(url, options, next) {
  if (typeof url !== 'string') {
    return Promise.reject(new TypeError('expected "url" to be a string'));
  }

  if (typeof options === 'function') {
    next = options;
    options = null;
  }

  const opts = Object.assign({}, options);
  const acc = { url, options: opts, pages: [], hrefs: [] };
  let prev;
  let res;

  while (url && typeof url === 'string' && prev !== url) {
    prev = url;
    acc.hrefs.push(url);
    res = await needle('get', url, null, opts);
    url = await next(acc.url, res, acc);
    acc.pages.push(res);
  }

  return acc;
};
