/* global before */
/* global it */
/* global describe */
"use strict";

let should = require('should');
let grab = require('../library');

describe('library.js', function () {
  let params;

  before(function (done) {
    let router = {
      get: function () {

      }
    };

    let middleware = {
      admin: {
        buildHeader: {

        }
      }
    };

    let controllers = {
      renderAdminPage: {

      }
    };

    params = { router, middleware, controllers };

    done();
  });

  it('Init say hello world', function (done) {
    grab.init(params);
    grab.getData().then(function (data) {
      
      done();
    })
  });

});