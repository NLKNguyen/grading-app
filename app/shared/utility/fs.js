(function () {
  'use strict'

  /**
   * @ngdoc service
   * @name app.service:fs
   * @description
   * fs - Node file system
   */
  angular
    .module('app')
    .factory('fs', fs)

  function fs() {
    const fs = require('fs') // Okay in NW.js
    return fs
  }

})()
