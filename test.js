'use strict';

require('mocha');
const assert = require('assert');
const isNumber = require('is-number');
const request = require('./');

function next(n) {
  return async function(url, resp, acc) {
    const regex = /pagination__next[\s\S]+?href="\/categories\/css\/page\/(\d+)\/"/;
    const num = (regex.exec(resp.body) || [])[1];

    if (isNumber(num) && +num <= n) {
      return url + `/page/${num}/`;
    }
  };
}

describe('paged-request', function() {
  it('should make a request for paged content', function(cb) {
    request('https://www.smashingmagazine.com/category/css', {}, next(2))
      .then(acc => {
        assert.equal(acc.pages.length, 2);
        cb();
      })
      .catch(cb);
  });
});
