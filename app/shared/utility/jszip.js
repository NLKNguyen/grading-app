(function () {
  'use strict'

  /**
   * @ngdoc service
   * @name app.service:jszip
   * @description
   * jszip - utility library for compressing objects into a zip file
   */
  angular
    .module('app')
    .factory('jszip', jszip)

  function jszip() {
    const jszip = require('jszip') // Okay in NW.js
    return jszip
  }

})()
