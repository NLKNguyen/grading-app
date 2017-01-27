(function () {
  'use strict';

  /**
   * @ngdoc service
   * @name app.service:nedb
   * @description
   * nedb - embeded no-SQL database engine
   * All public methods return Promise
   */
  angular
    .module('app')
    .service('GroupsService', GroupsService)

  /* @ngInject */
  function GroupsService($q, DatabaseContextService, _) {

    this.getAllGroups = () => this.findAllGroups()

    /**
     * @ngdoc method
     * @name findAllCriteria
     * @methodOf app.service:DataService
     * @description
     * Find all criteria and cache them
     *
     * @return {Promise} A Promise of criteria collection
     */
    this.findAllGroups = () => {
      const deferred = $q.defer()

      DatabaseContextService.getContext()
        .find({ type: 'group' }, (err, docs) => {
          if (err) {
            deferred.reject(err)
          } else {
            deferred.resolve(docs)
          }
        })

      return deferred.promise
    }

    // TODO: continue refactoring into here
  }

})()
