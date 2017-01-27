(function () {
  'use strict'

  /**
   * @ngdoc controller
   * @name app.controller:MainController
   * @description
   * Homepage of the application
   */
  angular
    .module('app')
    .controller('MainController', MainController)

  /* @ngInject */
  function MainController ($q, $location, $http, $mdDialog, $mdToast, DataService, ExportService,
    _, fs, moment) {
    this.databaseName = DataService.getDatabaseName()
    this.students = DataService.getCachedStudents()

    this.databaseLoaded = () => this.databaseName !== ''

    // Navigation {{{
    /**
     * @ngdoc method
     * @name navigateToStudentPageById
     * @methodOf app.controller:MainController
     * @description
     * Navigate to Student Page
     *
     * @param {string} studentId The student id
     */
    this.navigateToStudentPageById = (studentId) => {
      const idx = _.findIndex(this.students, '_id', studentId)
      if (idx !== -1) {
        $location.path(`/student/${idx}`)
      }
    }
    // }}}


    // Student Grouping {{{
    let selectedStudentIds = []

    /**
     * @ngdoc method
     * @name isStudentSelected
     * @methodOf app.controller:MainController
     * @description
     * Check if student is selected
     *
     * @param {object} student The student to be checked
     * @return {boolean} True if student is selected
     *
     */
    this.isStudentSelected = (student) => {
      return _.includes(selectedStudentIds, student._id)
    }

    /**
     * @ngdoc method
     * @name toggleSelection
     * @methodOf app.controller:MainController
     * @description
     * Toggle student checkbox in order to add into a group
     *
     * @param {object} student The selected student
     */
    this.toggleSelection = (student) => {
      const idx = _.indexOf(selectedStudentIds, student._id)
      if (idx === -1) {
        // Add to list if not in there yet
        selectedStudentIds.push(student._id)
        if (!_.isEmpty(student.criterion_ids)) {
          // Warn user that this student has been graded
          $mdDialog.show(
            $mdDialog.alert()
            .clickOutsideToClose(true)
            .title('Student is already graded')
            .content(student.name + ' is graded. Adding to a group will remove all previous grading.')
            .ok('Got it!')
          )
        }
      } else {
        // Remove from list if already in there
        _.pullAt(selectedStudentIds, idx)
      }
    }


    /**
     * @ngdoc method
     * @name makeGroup
     * @methodOf app.controller:MainController
     * @description
     * Make group from selected students
     *
     */
    this.makeGroup = () => {
      if (selectedStudentIds.length < 2) {
        // Let users know that a group needs at least 2 students
        $mdDialog.show(
          $mdDialog.alert()
          .clickOutsideToClose(true)
          .title('At least 2 selections are required')
          .content("Can't make a group with fewer than two students")
          .ariaLabel('Alert Dialog')
          .ok('Got it!')
        )
      } else {
        DataService.makeGroupFromStudentIds(selectedStudentIds)
          .then((numChanged) => {
            // console.log(num + ' students are grouped')
            this.navigateToStudentPageById(selectedStudentIds[0])
          })
      }

    }

    // }}}

    // Menu Option {{{

    /**
     * @ngdoc method
     * @name onOpeningDatabase
     * @methodOf app.controller:MainController
     * @description
     * Handle database file open
     *
     * @param {HTMLElement} element The source of event
     */
    this.onSelectDatabase = (element) => {
      if (!element.files[0]) return

      const path = element.files[0].path

      DataService.openFile(path).then((databaseName) => {
        DataService.findAllStudents().then((students) => {
          this.students = students
          this.databaseName = databaseName
        })
      })
        .catch(err => {
          console.log(err)
          $mdDialog.show(
            $mdDialog.alert()
            .clickOutsideToClose(true)
            .title('Error Loading Database')
            .content('Incorrect file format')
            .ok('Got it!')
          )
        })

    }


    let SaveFileAs = (fileName, fileType, fileContent) => {
      const a = document.createElement("a")
      document.body.appendChild(a)

      const blob = new Blob([fileContent], { type: fileType })

      a.href = window.URL.createObjectURL(blob)
      a.download = fileName
      a.style = "display: none"
      a.click()
    }

    let SaveBlobAsFile = (blob, fileName) => {
      const a = document.createElement("a")
      document.body.appendChild(a)

      a.href = window.URL.createObjectURL(blob)
      a.download = fileName
      a.style = "display: none"
      a.click()
    }

    this.onImportCriteriaFromJson = (element) => {
      if (!element.files[0]) return
      const path = element.files[0].path
      DataService.importCriteriaFromJson(path)
        .then(newCriteria => {
          $mdDialog.show(
            $mdDialog.alert()
            .clickOutsideToClose(true)
            .title('Import Succesfully')
            .content(`${newCriteria.length} criteria are added`)
            .ok('Got it!')
          )
        })
        .catch(err => {
          $mdToast.showSimple('Error importing criteria from file')
          console.log(err)
        })
    }

    this.onExportCriteriaToJson = () => {
      DataService.getNumberOfCriteria()
        .then(numOfCriteria => {
          console.log(numOfCriteria)
          if (numOfCriteria === 0) {
            $mdDialog.show(
              $mdDialog.alert()
              .clickOutsideToClose(true)
              .title('No criteria')
              .content('There must be criteria in order to be exported')
              .ok('Got it!')
            )
            return
          } else {
            $mdToast.showSimple('Generate JSON file')
            ExportService.createCriteriaBlob().then(blob => {
              SaveBlobAsFile(blob, `criteria-${this.databaseName}`)
            })
          }
        })
    }

    this.onExportForAnalysis = () => {
      // TODO: check if empty database
      $mdToast.showSimple('Generate ZIP file')
      ExportService.createDataForAnalysisBlob().then(blob => {
        SaveBlobAsFile(blob, `data-${this.databaseName}.zip`)
      }).catch(err => {
        console.log(err)
      })
    }

    this.onSendDataForAnalysis = () => {
      $mdToast.showSimple('Generate ZIP file')


      ExportService.createDataForAnalysisBlob().then(blob => {
        const formData = new FormData() // eslint-disable-line no-undef
        formData.append("file", $scope.file)
        $http({
          method: 'POST',
          url: 'http://172.18.0.2:3000/analytic',
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }).then(res => {
          console.log(res)
        }, err => {
          console.log(err)
        })
      }).catch(err => {
        console.log(err)
      })
    }


    this.onExportGradingSheet = () => {
      // TODO: check if empty database
      $mdToast.showSimple('Generate CSV file')
      ExportService.creatGradingSheetBlob().then(blob => {
        SaveBlobAsFile(blob, `${this.databaseName}.csv`)
      })
    }

    this.onImportStudentsFromCsv = (element) => {
      if (!element.files[0]) return
      const path = element.files[0].path


      if (_.isEmpty(this.databaseName)) {
        $mdDialog.show(
          $mdDialog.alert()
          .clickOutsideToClose(true)
          .title('No Database Selected')
          .content('A database must be opened in order to import')
          .ok('Got it!')
        )
        return
      }

      // const fs = require('fs')
      // const content = fs.readFileSync(path, 'utf8')
      // if (content) {
      //   // read csv
      //   // analyze headers
      //   // show mapping options
      // }
      // Converter Class
      const Converter = require('csvtojson').Converter
      const converter = new Converter({})

      converter.on('end_parsed', (jsonArray) => {
        // console.log(jsonArray)
        // if (_.size(jsonArray) > 0) {
        //   console.log(Object.keys(jsonArray[0]))
        // }
        // TODO: give schema mappping options instead of autopicking first 3 columns
        const newStudents = []
        _.forEach(jsonArray, columns => {
          const keys = Object.keys(columns)
          if (!_.find(this.students, { identifier: columns[keys[0]] })) {
            newStudents.push({
              type: 'student',
              identifier: columns[keys[0]],
              name: columns[keys[1]],
              contact: columns[keys[2]]
            })
          }
        })
        console.log(newStudents)

        DataService.insertStudents(newStudents).then(numAdded => {
          console.log(numAdded)
          DataService.findAllStudents().then(students => {
            this.students = students
            $mdDialog.show(
              $mdDialog.alert()
              .clickOutsideToClose(true)
              .title('Import Succesfully')
              .content(`${numAdded} students are added`)
              .ok('Got it!')
            )
          })
        })

      })

      require("fs").createReadStream(path).pipe(converter)
    }

    this.isDatabaseOpened = () => _.isEmpty(this.databaseName)
    // }}}


  } // end of MainController

})()
