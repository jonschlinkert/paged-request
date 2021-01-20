'use strict';

require('mocha');
const assert = require('assert');
const request = require('./');

function next(limit) {
  return async function(url, res, acc) {
    const regex = /href=[^\s]*?\/page\/(\d+)\//g;
    let matches;
    while (matches = regex.exec(res.data)) {
      if (matches === null) {
        break;
      }
      const num = parseInt(matches[1], 10);
      if (isNaN(num)) {
        break;
      }
      const url = `${acc.orig}/page/${num}/`;
      // If we have already requested this `url`, we will skip it, and try the next `url` on the page.
      if (acc.urls.includes(url)) {
        continue;
      }
      if (num > limit) {
        break;
      }
      return url;
    }
  };
}

describe('paged-request', function() {
  this.timeout(10000);

  it('should make a request for paged content', function() {
    const limit = 2;
    return request('https://www.smashingmagazine.com/category/css', {}, next(limit))
      .then(acc => {
        assert.strictEqual(acc.pages.length, limit);
      });
  });

  it('should throw an error when page does not exist', function() {
    const limit = 1;
    return request('https://www.smashingmagazine.com/dflsjfslkfskfjds', {}, next(limit))
      .then(() => {
        throw new Error('expected an error');
      })
      .catch(err => {
        assert.ok(/404/.test(err.message));
      });
  });

  it('should keep the history of `urls`', function() {
    const limit = 3;
    return request('https://www.smashingmagazine.com/category/css', {}, next(limit))
      .then(acc => {
        assert.deepStrictEqual(acc.urls, [
          'https://www.smashingmagazine.com/category/css',
          'https://www.smashingmagazine.com/category/css/page/2/',
          'https://www.smashingmagazine.com/category/css/page/3/'
        ]);
      });
  });
});
