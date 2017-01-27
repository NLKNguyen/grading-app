(function () {
  'use strict'

  angular
    .module('app')
    .run(extra)

  /**
   * Enable some JavaScript to manipulate the DOM
   */
  function extra($rootScope) {
    $rootScope.$on("$viewContentLoaded", function () {
      componentHandler.upgradeAllRegistered()
    })
  }
})()
