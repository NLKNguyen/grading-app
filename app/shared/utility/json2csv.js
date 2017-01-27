(function () {
  'use strict'

  /**
   * @ngdoc service
   * @name app.service:json2csv
   * @description
   * json2csv - utility library for coverting json to csv
   */
  angular
    .module('app')
    .factory('json2csv', json2csv)

  function json2csv() {
    const json2csv = require('json2csv') // Okay in NW.js
    return json2csv
  }

})()
