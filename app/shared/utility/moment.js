(function () {
  'use strict'

  /**
   * @ngdoc service
   * @name app.service:moment
   * @description
   * Moment - utility library for date time
   */
  angular
    .module('app')
    .factory('moment', moment)

  function moment() {
    const moment = require('moment') // Okay in NW.js
    return moment
  }

})()
