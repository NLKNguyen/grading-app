(function () {
  'use strict'

  /**
   * @ngdoc controller
   * @name app.controller:StudentController
   * @description
   * Single student page
   *
   * @requires $routeParams
   * @requires $location
   * @requires app.service:DataService
   * @requires app.service:_
   */
  angular
    .module('app')
    .controller('StudentController', StudentController)

  /* @ngInject */
  function StudentController ($routeParams, $location, DataService, _, moment) {
    // Initialization {{{
    let currentIndex = $routeParams.index
    let student_id, group_id // Database Document ID
    this.criteria = DataService.getCachedCriteria()

    // Load student info and criteria
    DataService.findStudentByIndex(currentIndex)
      .then((student) => {
        student_id = student._id
        group_id = student.group_id

        this.identifier = student.identifier
        this.name = student.name
        this.contact = student.contact
        this.score = student.score
        this.modified = student.modified
        this.criterion_ids = student.criterion_ids
        this.summary = ''

        if (group_id) { // student is in a group
          DataService.findGroupMembersById(group_id)
            .then(groupMembers => {
              // exclude the current student in the list of other students in group
              this.otherGroupMembers = _.filter(groupMembers, (member) => member.identifier !== this.identifier)
            })
        }

        // Helper function to mark checkboxes
        const markCheckboxes = () => {
          // Add checked property to all criteria
          _.forEach(this.criteria, criterion => {
            criterion.checked = _.includes(this.criterion_ids, criterion._id)
          })
        }

        if (this.criteria !== null) { // cache is available
          markCheckboxes()
          // console.log('use cached criteria')
        } else {
          // console.log('don\'t use cached criteria')
          DataService.findAllCriteria()
            .then(criteria => {
              this.criteria = criteria
              markCheckboxes()
            })
        }
      })

    // }}}

    // //////////////////////////////

    // Navigation {{{
    this.navigateToMainPage = () => {
      $location.path('/main')
    }

    /**
     * @ngdoc method
     * @name navigateToNextStudentPage
     * @methodOf app.controller:StudentController
     * @description
     * Navigate to the next student page according to the index in the list
     */
    this.navigateToNextStudentPage = () => {
      $location.path('/student/' + getCorrectIndex(++currentIndex))
    }

    /**
     * @ngdoc method
     * @name navigateToStudentPageById
     * @methodOf app.controller:StudentController
     * @description
     * Navigate to the student page based on student id
     *
     * @param {string} studentId The student id
     */
    this.navigateToStudentPageById = (studentId) => {
      const idx = _.findIndex(DataService.getCachedStudents(), '_id', studentId)
      if (idx !== -1) {
        $location.path(`/student/${idx}`)
      }
    }

    /**
     * @ngdoc method
     * @name navigateToPreviousStudentPage
     * @methodOf app.controller:StudentController
     * @description
     * Navigate to the preivous student page according to the index in the array
     */
    this.navigateToPreviousStudentPage = () => {
      $location.path('/student/' + getCorrectIndex(--currentIndex))
    }

    /**
     * @ngdoc method
     * @private
     * @name getCorrectIndex
     * @methodOf app.controller:StudentController
     * @description
     * Get the correct index in the student list based on the input index.
     * Wrapping around if the input index is out of bound.
     *
     * @param {number} index The attempted index in the array
     * @return {number} The correct index (after wrapping around if needed)
     */
    const getCorrectIndex = (index) => {
      let correctIndex = index
      const numOfStudents = DataService.getNumberOfStudents()
      if (index < 0) {
        correctIndex = numOfStudents - 1
      } else if (index >= numOfStudents) {
        correctIndex = 0
      }
      return correctIndex
    }

    /**
     * @ngdoc method
     * @name navigateToCriterionPage
     * @methodOf app.controller:StudentController
     * @description
     * Navigate to the preivous student page according to the index in the array
     */
    this.navigateToCriterionPage = (criterion = null) => {
      const criterionId = (criterion ? criterion._id : '_')
      $location.path(`/criterion/${currentIndex}/${criterionId}`)
    }
    // Navigation }}}



    /**
     * @ngdoc method
     * @name criterionSectionAsString
     * @methodOf app.controller:StudentController
     * @description
     *
     * @param {Array} section The section numbers
     * @return {String} The string representation of section numbers
     */
    this.criterionSectionAsString = (section) => {
      const strList = []
      // drop trailing non-number elements (i.e. empty values)
      const section_trimmedRight = _.dropRightWhile(section, e => !_.isNumber(e))
      _.forEach(section_trimmedRight, e => { strList.push(e.toString()) })
      return strList.join('.')
    }

    this.criterionOnClick = (criterion) => {
      DataService.toggleCriterion(student_id, criterion, group_id)
        .then((updatedStudent) => {
          this.criterion_ids = updatedStudent.criterion_ids
          this.score = updatedStudent.score
          this.modified = updatedStudent.modified
        })
    }


    this.leaveGroup = () => {
      DataService.removeStudentFromGroup(student_id, group_id)
        .then((numChanged) => {
          this.navigateToMainPage()
        })
    }


    this.makeSummary = () => {
      const strList = _(this.criteria)
        .filter(criterion => criterion.checked)
        .map(criterion => `(${criterion.points}) : ${criterion.description}`)

      this.summary = strList.join('\n')
    }
  } // end of StudentController
}())
