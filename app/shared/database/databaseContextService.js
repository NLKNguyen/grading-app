(function () {
  'use strict'

  /**
   * @ngdoc service
   * @name app.service:nedb
   * @description
   * nedb - embeded no-SQL database engine
   */
  angular
    .module('app')
    .service('DatabaseContextService', DatabaseContextService)

  /* @ngInject */
  function DatabaseContextService() {
    let db = null
    this.getContext = () => db
    this.setContext = (obj) => { db = obj }
  }

})()
