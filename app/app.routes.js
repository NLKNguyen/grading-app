(function () {
  'use strict'

  angular
    .module('app')
    .config(config)

  /* @ngInject */
  function config($routeProvider) {
    const COMPONENTS_PATH = 'app/components/'

    $routeProvider
      .when('/main', {
        templateUrl: `${COMPONENTS_PATH}/main/mainView.html`,
        controller: 'MainController',
        controllerAs: 'vm'
      })
      .when('/student/:index', {
        templateUrl: `${COMPONENTS_PATH}/student/studentView.html`,
        controller: 'StudentController',
        controllerAs: 'vm'
      })
      .when('/criterion/:studentIndex/:criterionId', {
        templateUrl: `${COMPONENTS_PATH}/criterion/criterionView.html`,
        controller: 'CriterionController',
        controllerAs: 'vm'
      })

    // .when('/report', {
    //   templateUrl: `${COMPONENTS_PATH}/criterion/criterionView.html`,
    //   controller: 'CriterionController', controllerAs: 'vm'
    // })
      .otherwise({
        redirectTo: '/main'
      })
  }
})()
