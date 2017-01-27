(function() {
  'use strict'

  /**
   * @ngdoc service
   * @name app.service:nedb
   * @description
   * nedb - embeded no-SQL database engine
   */
  angular
    .module('app')
    .factory('nedb', nedb)

  function nedb() {
    const nedb = require('nedb') // Okay in NW.js
    return nedb
  }

})()
