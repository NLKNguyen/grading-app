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
    .service('CriteriaService', CriteriaService)

  /* @ngInject */
  function CriteriaService($q, DatabaseContextService, _) {
    let cachedCriteria = null

    this.invalidateCache = () => {
      cachedCriteria = null
    }

    this.validateCache = () => {
      //TODO: check if cache is consist with real data
      // for testing purpose
    }

    this.getAllCriteria = () => {
      return (cachedCriteria != null) ? cachedCriteria : this.findAllCriteria()
    }

    this.getNumberOfCriteria = () => {
      return (cachedCriteria != null) ? cachedCriteria.length : this.findAllCriteria().then(criteria => criteria.length)
    }

    /**
     * @ngdoc method
     * @name findAllCriteria
     * @methodOf app.service:DataService
     * @description
     * Find all criteria and cache them
     *
     * @return {Promise} A Promise of criteria collection
     */
    this.findAllCriteria = () => {
      const deferred = $q.defer()

      DatabaseContextService.getContext()
        .find({ type: 'criterion' }, (err, docs) => {
          if (err) {
            deferred.reject(err)
          } else {
            cachedCriteria = docs
            // sortCachedCriteria()
            deferred.resolve(cachedCriteria)
          }
        })

      return deferred.promise
    }
  }

})()
