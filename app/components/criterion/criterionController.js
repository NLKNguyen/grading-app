(function () {
  'use strict'

  /**
   * @ngdoc controller
   * @name app.controller:CriterionController
   * @description
   * Criterion Controller
   *
   * @requires $routeParams
   * @requires $location
   * @requires app.service:DataService
   * @requires app.service:_
   */
  angular
    .module('app')
    .controller('CriterionController', CriterionController)

  /* @ngInject */
  function CriterionController ($routeParams, $location, DataService, _) {
    /**
     * In order to go back to the student details page
     */
    let studentIndex = $routeParams.studentIndex

    /**
     * In case of editing a criteria, this will contain its Id
     */
    let criterion_id = $routeParams.criterionId
    this.isNew = (criterion_id === '_')

    /**
     * The order of how the criterias will be listed
     *  ex: [ 1, 2, null ]
     */
    this.section = ['', '', '']
    this.description = ''
    this.points = ''


    if (!this.isNew) {
      DataService.findCriterionById(criterion_id)
        .then(criterion => {
          this.section = criterion.section
          this.description = criterion.description
          this.points = criterion.points
        })
    }


    ////////////////////////////////

    // Navigation {{{
    this.navigateToStudentPage = () => {
      console.log("navigateToStudentPage()")
      $location.path(`/student/${studentIndex}`)
    }

    // }}}

    // Save / Delete {{{

    this.saveIt = () => {
      const sectionNumbers = _(this.section)
        .map(parseFloat) // convert section input to number
        .map(e => _.isNaN(e) ? '' : e) // if NaN then use empty string
        .value()

      if (this.isNew) {
        DataService.createCriterion(sectionNumbers, this.description, Number(this.points))
          .then(criterion => {
            this.navigateToStudentPage()
          })
          .catch(() => {
            console.log("Error adding new criterion")
          })
      } else { // Update
        DataService.updateCriterionById(criterion_id, sectionNumbers, this.description, Number(this.points))
          .then(() => {
            this.navigateToStudentPage()
          })
          .catch(() => {
            console.log("Error updating existing criterion")
          })
      }
    }

    this.isDataNotValid = () => {
      // An unfortunate of JavaScript to correctly detect if a string is numeric
      const fn_isNumeric = e => !isNaN(parseFloat(e)) && isFinite(e)
      const fn_isEmptyOrNumeric = e => (e === '' || fn_isNumeric(e))

      const isSectionValid = this.section.reduce((a, e) => a && fn_isEmptyOrNumeric(e), true)

      return !(isSectionValid && fn_isNumeric(this.points) && !_.isEmpty(this.description))
    }

    this.deleteIt = () => {
      DataService.deleteCriterionById(criterion_id, Number(this.points))
        .then(() => {
          this.navigateToStudentPage()
        })
    }

    // }}}

  } // end of CriterionController

}())
