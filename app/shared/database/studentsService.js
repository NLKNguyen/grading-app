(function () {
  'use strict'

  /**
   * @ngdoc service
   * @name app.service:nedb
   * @description
   * nedb - embeded no-SQL database engine
   * All public methods return Promise
   */
  angular
    .module('app')
    .service('StudentsService', StudentsService)

  /* @ngInject */
  function StudentsService($q, DatabaseContextService, _) {
    // TODO: refactor into here

  }

})()
