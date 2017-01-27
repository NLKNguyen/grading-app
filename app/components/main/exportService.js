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
    .service('ExportService', ExportService)

  /* @ngInject */
  function ExportService ($q, DataService, _, json2csv, jszip, moment) {

    this.createCriteriaBlob = () => {
      return DataService.findAllCriteria().then(criteria => {
        const fileContent = JSON.stringify(criteria)
        const contentType = 'text/json'
        return new Blob([fileContent], { type: contentType })
      })
    }

    this.createDataForAnalysisBlob = () => {
      let promises = [ generateCriteriaCsv(), generateStudentGradesCsv() ]
      return $q.all(promises).then( ([criteriaCsv, studentGradesCsv]) => {
        // console.log(criteriaCsv);
        // console.log(studentGradesCsv);
        let zip = new jszip()
        zip.file('criteria.csv', criteriaCsv)
        zip.file('student-grades.csv', studentGradesCsv)

        return zip.generateAsync({type:"base64"}).then(base64 =>  {
          const blob = base64toBlob(base64, { type: 'application/zip' })
          return blob
        }, err => {
          console.log(err)
          // deferred.reject();
        })
      })
    }


    // TODO: this is duplicate from studentController.js
    let criterionSectionAsString = (section) => {
      const strList = []
      // drop trailing non-number elements (i.e. empty values)
      const section_trimmedRight = _.dropRightWhile(section, e => !_.isNumber(e))
      _.forEach(section_trimmedRight, e => { strList.push(e.toString()) })
      return strList.join('.')
    }

    let convertObjectToCsv = (obj) => {
      const deferred = $q.defer()
      json2csv(obj, (err, csv) => {
        if (err) {
          deferred.reject(err)
          // console.log(err);
        } else {
          deferred.resolve(csv)
        }
      });
      return deferred.promise;
    }

    let generateCriteriaCsv = () => {
      return DataService.findAllCriteria().then(criteria => {
        let data = []
        let counter = 1
        _.forEach(criteria, criterion => {
          data.push( {
            header : `Criterion${counter++}`,
            section : criterionSectionAsString(criterion.section),
            description : criterion.description,
            points : criterion.points
          })
        })
        // console.log(data);
        return convertObjectToCsv({data})
      })
    }



    let generateStudentGradesCsv = () => {
      const promises = [ DataService.findAllCriteria(), DataService.findAllStudents(), DataService.getAllGroups() ]
      return $q.all(promises).then(( [criteria, students, groups] ) => {
        const data = []
        const fields = ['identifier', 'name', 'contact', 'group', 'score']
        _.forEach(criteria, (criterion, idx) => {
          fields.push(`Criterion${idx + 1}`)
        })
        _.forEach(students, student => {
          const record = {
            identifier: student.identifier,
            name: student.name,
            contact: student.contact,
            score: student.score
          }
          if (_.has(student, 'group_id')) {
            _.forEach(groups, (group, idx) => {
              if (student.group_id === group._id) {
                record['group'] = `Group${idx + 1}`
                return
              }
            })
          }
          // let counter = 1;
          _.forEach(criteria, (criterion, idx) => {
            const header = `Criterion${idx + 1}`
            record[header] = _.includes(student.criterion_ids, criterion._id) ? 1 : 0
          })
          data.push(record)
        })
        // console.log(data);

        return convertObjectToCsv({data, fields})
      })
    }

    /*
        http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
        */
    let base64toBlob = (b64Data, contentType, sliceSize) => {
      contentType = contentType || ''
      sliceSize = sliceSize || 512

      var byteCharacters = atob(b64Data)
      var byteArrays = []

      for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize)

        var byteNumbers = new Array(slice.length)
        for (var i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i)
        }

        var byteArray = new Uint8Array(byteNumbers)

        byteArrays.push(byteArray)
      }

      var blob = new Blob(byteArrays, {type: contentType})
      return blob
    }


    this.creatGradingSheetBlob = () => {
      let promises = [ DataService.findAllCriteria(), DataService.findAllStudents() ]
      return $q.all(promises).then(( [criteria, students] ) => {
        // if (students.length == 0) {
        //     return $q.reject(new Error("there is no student record in order to export"));
        // }
        const data = []
        _.forEach(students, student => {
          let feedback = []
          _.forEach(criteria, criterion => {
            if (_.includes(student.criterion_ids, criterion._id)) {

              const safeHTML = (`(${criterion.points}) : ${criterion.description}`)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')

              feedback.push(`<p>${safeHTML}</p>`)
              // feedback.push(`(${criterion.points}) : ${criterion.description}`);
            }
          })

          const isNumeric = e => !isNaN(parseFloat(e)) && isFinite(e)
          const exportedTime = moment().format('dddd, MMMM DD, YYYY, h:mm A')

          data.push({
            identifier: `${student.identifier}`,
            name: `${student.name}`,
            grade: isNumeric(student.score) ? student.score : 0,
            exported_time: exportedTime,
            feedback: `${feedback.join('')} `
          })
        })

        const fields = ['identifier', 'name', 'grade', 'exported_time', 'feedback']
        return convertObjectToCsv({ data, fields }).then(csv => {
          return new Blob([csv], { type: 'text/csv' })
        })

        // const fields = ['identifier', 'name', 'grade', 'exported_time', 'feedback'];
        // const fieldNames = ['identifier', 'name', 'grade', 'exported_time', 'feedback']; // TODO: redundant
        // json2csv({ data, fields, fieldNames }, (err, csv) => {
        //     if (err) {
        //         console.log(err);
        //         $mdToast.showSimple('Error on generating CSV file');
        //     } else {
        //         $mdToast.showSimple('CSV file is generated');
        //         SaveFileAs(`${this.databaseName}.csv`, 'text/csv', csv);
        //     }
        // });

      })
    }
  }

})()
