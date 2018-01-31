'use strict';

const url = require('url');
const needle = require('needle');

module.expots = async function paged(href, options, next) {
  const opts = Object.assign({}, url.parse(href), options);
  const acc = { href, options: opts, pages: [], hrefs: [] };
  let res;

  while (typeof href === 'string' && acc.hrefs.indexOf(href) === -1) {
    acc.hrefs.push(href);
    res = await needle('get', href, opts);
    href = await next(res, acc);
    acc.pages.push(res);
  }

  return acc;
};
