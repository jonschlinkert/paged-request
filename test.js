'use strict';

require('mocha');
const assert = require('assert');
const request = require('./');

function next(n) {
  return async function(url, resp, acc) {
    const regex = /href="\/categories\/css\/page\/(\d+)\/"/;
    const num = (regex.exec(resp.data) || [])[1];
    if (/^[0-9]+$/.test(num) && +num <= n) {
      return `${url}/page/${num}/`;
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

  it('should keep the history of `hrefs`', function(cb) {
    request('https://www.smashingmagazine.com/category/css', {}, next(3))
      .then(acc => {
        assert.deepEqual(acc.hrefs, [
          'https://www.smashingmagazine.com/category/css',
          'https://www.smashingmagazine.com/category/css/page/2/',
          'https://www.smashingmagazine.com/category/css/page/3/'
        ]);
        cb();
      })
      .catch(cb);
  });
});
