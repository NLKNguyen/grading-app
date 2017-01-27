(function () {
  'use strict'

  /**
   * @ngdoc service
   * @name app.service:_
   * @description
   * Lodash - utility library for data manipulation
   */
  angular
    .module('app')
    .factory('_', lodash)

  function lodash() {
    const _ = require('lodash') // Okay in NW.js
    return ( _ )
  }

})()
