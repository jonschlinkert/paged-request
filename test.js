'use strict';

require('mocha');
const assert = require('assert');
const request = require('./');

function next(limit) {
  return async function(url, res, acc) {
    const regex = /href=".*?\/page\/(\d+)\/"/;
    const num = (regex.exec(res.data) || [])[1];
    if (num && /^[0-9]+$/.test(num) && +num <= limit) {
      return `${acc.orig}/page/${num}/`;
    }
  };
}

describe('paged-request', function() {
  this.timeout(10000);

  it('should make a request for paged content', function() {
    return request('https://www.smashingmagazine.com/category/css', {}, next(2))
      .then(acc => {
        assert.equal(acc.pages.length, 2);
      })
  });

  it('should throw an error when page does not exist', function() {
    return request('https://www.smashingmagazine.com/dflsjfslkfskfjds', {}, next(2))
      .then(() => {
        throw new Error('expected an error');
      })
      .catch(err => {
        assert(/404/.test(err.message));
      })
  });

  it('should keep the history of `urls`', function(cb) {
    request('https://www.smashingmagazine.com/category/css', {}, next(3))
      .then(acc => {
        assert.deepEqual(acc.urls, [
          'https://www.smashingmagazine.com/category/css',
          'https://www.smashingmagazine.com/category/css/page/2/',
          'https://www.smashingmagazine.com/category/css/page/3/'
        ]);
        cb();
      })
      .catch(cb);
  });
});
