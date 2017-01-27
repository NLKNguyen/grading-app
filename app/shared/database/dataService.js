(function () {
  'use strict'

  /**
   * @ngdoc service
   * @name app.service:DataService
   * @description
   * Interface to the database
   *
   * @requires $q
   * @requires app.service:_
   */
  angular
    .module('app')
    .service('DataService', DataService)

  /* @ngInject */
  function DataService($q, DatabaseContextService, CriteriaService, StudentsService, GroupsService,
    _ , moment, nedb)
  {

    // Member variables {{{

    // const DataStore = nedb
    // let db = null
    let db = DatabaseContextService.getContext()

    let databaseName = ''
    let cachedStudents = []
    let cachedCriteria = null // = []

    // }}}

    ////////////////////////////////

    // Getters {{{

    /**
     * Get Database Name
     * @return {String} the database name
     */
    this.getDatabaseName = () => databaseName

    /**
     * Get Cached Students
     * @return {String} cached students
     */
    this.getCachedStudents = () => cachedStudents


    /**
     * @ngdoc method
     * @name getCachedCriteria
     * @methodOf app.service:DataService
     * @description
     * Get cached criteria collection
     */
    this.getCachedCriteria = () => cachedCriteria


    this.getNumberOfCriteria = () => CriteriaService.getNumberOfCriteria()

    this.getAllGroups = () => GroupsService.getAllGroups()
    // }}}

    ////////////////////////////////

    // /**
    // * Open Database File
    // * @param {String} path File path
    // * @return {Promise} A promise of database name
    // */
    // this.openFile = (path) => {
    //     DatabaseContextService.getContext()
    //     DatabaseContextService.openFile(path).then( () => {
    //         databaseName = path.replace(/^.*[\\\/]/, '')
    //         return databaseName
    //     })
    // }
    //
    /**
     * Open Database File
     * @param {String} path File path
     * @return {Promise} A promise of database name
     */
    this.openFile = (path) => {
      const deferred = $q.defer()
      DatabaseContextService.setContext(new nedb({ filename: path }))
      DatabaseContextService.getContext()
        .loadDatabase((err) => {
          if (err) {
            deferred.reject(err)
          } else {
            databaseName = path.replace(/^.*[\\\/]/, '') // strip all but the folder name
            deferred.resolve(databaseName)
          }
        })
      return deferred.promise
    }

    // this.saveDocumentsToFile = (docs, path) => {
    //   const deferred = $q.defer()
    //   const file = new DataStore({ filename: path, autoload: true })
    //   file.insert(docs, function (err, newDocs) {
    //     if (err) {
    //       console.log(err)
    //       deferred.reject(err)
    //     } else {
    //       deferred.resolve()
    //     }
    //   })
    //   return deferred.promise
    // }



    /**
     * Find All Documents of Type Student
     * @return {Promise} A Promise of student list
     *
     */
    this.findAllStudents = () => {
      const deferred = $q.defer()
      DatabaseContextService.getContext()
        .find({ type: 'student' })
        .sort({ identifier: 1, name: 1, contact: 1 })
        .exec((err, docs) => {
          if (err) {
            deferred.reject(err)
          } else {
            cachedStudents = docs
            deferred.resolve(docs)
          }
        })
      return deferred.promise
    }

    /**
     * Make a New Group from Student Ids
     * @param {array} studentIds Ids of students to join a group
     * @return {Promise} A Promise of the number of students joined a group
     */
    this.makeGroupFromStudentIds = (studentIds) => {
      return createNewGroup().then((group) => addStudentsToGroup(studentIds, group._id))
    }

    let createNewGroup = () => {
      const deferred = $q.defer()
      DatabaseContextService.getContext()
        .insert({ type: 'group' }, (err, newGroup) => {
          if (err) {
            deferred.reject(err)
          } else {
            deferred.resolve(newGroup)
          }
        })
      return deferred.promise
    }

    let addStudentsToGroup = (studentIds, groupId) => {
      const deferred = $q.defer()
      DatabaseContextService.getContext()
        .update({ _id: { $in: studentIds } }, {
          $set: {
            group_id: groupId,
            criterion_ids: [],
            score: 0,
            modified: getCurrentFormattedTime()
          }
        }, { multi: true }, (err, numChanged) => {
          if (err) {
            deferred.reject(err)
          } else {
            updateGroupIdOfCachedStudents(studentIds, groupId)
            deferred.resolve(numChanged)
          }
        })
      return deferred.promise
    }

    let updateGroupIdOfCachedStudents = (studentIds, groupId) => {
      // _.forEach(studentIds, (studentId) {
      //   const match = _.where(cachedStudents, {_id: studentId})
      //   if (!_.isEmpty(match)) {
      //     match[0].group_id = group_id
      //     match[0].criterias = null
      //   }
      // })
      const remainingIds = _.clone(studentIds)
      remainingIds.sort()

      for (let i = 0; i < cachedStudents.length; i++) {
        const student = cachedStudents[i]
        if (remainingIds.length > 0) {
          const idx = _.indexOf(remainingIds, student._id, true)
          if (idx !== -1) {
            student.group_id = groupId
            student.criterion_ids = []
            student.score = 0
            _.pullAt(remainingIds, idx)
          }
        } else {
          break
        }
      }

    }

    /**
     * @ngdoc method
     * @name getNumberOfStudents
     * @methodOf app.controller:StudentController
     * @description
     * Get the number of students
     *
     * @return {number} The number of students
     */
    this.getNumberOfStudents = () => cachedStudents.length

    // Student Retrieval {{{

    /**
     * Find Student by Index
     * @param {number} index The index in cached student list
     * @return {Promise} A Promise for a student
     */
    this.findStudentByIndex = (index) => {
      const deferred = $q.defer()

      if (cachedStudents.length > 0 &&
        index > -1 && index < cachedStudents.length) {
        const studentId = cachedStudents[index]._id
        return this.findStudentById(studentId)
      } else {
        deferred.reject()
      }

      return deferred.promise
    }

    this.findStudentById = (studentId) => {
      const deferred = $q.defer()

      DatabaseContextService.getContext()
        .findOne({ _id: studentId }, (err, student) => {
          if (err) {
            deferred.reject(err)
          } else {
            deferred.resolve(student)
          }
        })

      return deferred.promise
    }
    /**
     * Find Group Members by Group Id
     * @param {String} groupId The group id
     * @return {Promise} A Promise of a student list
     */
    this.findGroupMembersById = (groupId) => {
      const deferred = $q.defer()

      // type: 'student'
      DatabaseContextService.getContext()
        .find({ group_id: groupId }, (err, students) => {
          if (err) {
            deferred.reject(err)
          } else {
            deferred.resolve(students)
          }
        })

      return deferred.promise
    }

    // }}}

    // Criterion Retrieval {{{

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
            sortCachedCriteria()
            deferred.resolve(cachedCriteria)
          }
        })

      return deferred.promise
    }

    this.findCriterionById = (criterionId) => {
      const deferred = $q.defer()

      DatabaseContextService.getContext()
        .findOne({ _id: criterionId }, (err, criterion) => {
          if (err) {
            deferred.reject(err)
          } else {
            deferred.resolve(criterion)
          }
        })

      return deferred.promise
    }

    let deleteCriterion = (criterionId) => {
      const deferred = $q.defer()

      DatabaseContextService.getContext()
        .remove({ _id: criterionId }, (err, numRemoved) => {
          if (err) {
            deferred.reject(err)
          } else {
            deferred.resolve(numRemoved)
          }
        })
      return deferred.promise
    }

    let changeStudentScore = (criterionId, pointsDifference, option = null) => {
      const deferred = $q.defer()

      const modifier = {
        $inc: { score: pointsDifference },
        $set: { modified: getCurrentFormattedTime() }
      }

      if (option && option.removeCriterionId === true) {
        modifier['$pull'] = { criterion_ids: criterionId }
      }

      DatabaseContextService.getContext()
        .update({ criterion_ids: criterionId }, modifier, { multi: true },
          (err, numChanged) => {
            if (err) {
              console.log("can't update student score")
              deferred.reject(err)
            } else {
              deferred.resolve(numChanged)
            }
          })

      return deferred.promise
    }

    this.deleteCriterionById = (criterionId, points) => {
      const deferred = $q.defer()

      let pointsNumber = parseFloat(points)
      pointsNumber = _.isNaN(pointsNumber) ? 0 : pointsNumber

      const promises = [
        deleteCriterion(criterionId),
        changeStudentScore(criterionId, -pointsNumber, { removeCriterionId: true })
      ]

      // Whether multiple async database updates can be a problem or not is unclear.
      // In case of problem, make them run sequentially.

      $q.all(promises).then(() => {
        // update cache
        _.remove(cachedCriteria, criterion => _.isEqual(criterion._id, criterionId))
        _.forEach(cachedStudents, student => {
          const idx = _.indexOf(student.criterion_ids, criterionId)
          if (idx !== -1) {
            _.pullAt(student.criterion_ids, idx)
            student.score += -pointsNumber // for consistency, otherwise -= would be more natural
          }
        })


        deferred.resolve()
      })

      return deferred.promise
    }



    let addCriterionToCache = (criterion) => {
      cachedCriteria.push(criterion)
      sortCachedCriteria()
    }

    // let deleteCriterionFromCache = (criterion) => {
    //   cachedCriteria.push(criterion)
    //   sortCachedCriteria()
    // }
    this.createCriterion = (section, description, points) => {
      const deferred = $q.defer()

      const criterion = { type: 'criterion', section, description, points }
      DatabaseContextService.getContext()
        .insert(criterion, (err, newCriterion) => {
          if (err) {
            deferred.reject(err)
          } else {
            addCriterionToCache(newCriterion)
            deferred.resolve(newCriterion)
          }
        })

      return deferred.promise
    }

    let sortCachedCriteria = () => {
      cachedCriteria = _.sortByAll(cachedCriteria, ['section[0]', 'section[1]', 'section[2]', 'description'])
    }


    let updateCriterion = (criterionId, section, description, pointsNumber) => {
      const deferred = $q.defer()

      DatabaseContextService.getContext()
        .update({ _id: criterionId }, {
          $set: { section, description, points: pointsNumber }
        }, { multi: false }, (err, numReplaced) => {
          if (err) {
            deferred.reject(err)
          } else {
            deferred.resolve(numReplaced)
          }
        })
      return deferred.promise
    }

    this.updateCriterionById = (criterionId, section, description, points) => {
      const deferred = $q.defer()

      let pointsNumber = parseFloat(points)
      pointsNumber = _.isNaN(pointsNumber) ? 0 : pointsNumber

      const promises = [
        updateCriterion(criterionId, section, description, pointsNumber),
      ]

      const criterion = _.first(_.where(cachedCriteria, { _id: criterionId }))

      const pointsDifference = pointsNumber - criterion.points
      if (pointsDifference !== 0) {
        promises.push(changeStudentScore(criterion._id, pointsDifference))
      }

      $q.all(promises)
        .then(() => {
          // update cache {{{
          const needSort = !_.isEqual(criterion.section, section)
          if (needSort) {
            sortCachedCriteria()
          }

          if (pointsDifference !== 0) {
            const students = _.where(cachedStudents,
              student => _.includes(student.criterion_ids, criterion._id))

            _.forEach(students, student => {
              student.score += pointsDifference
              student.modified = getCurrentFormattedTime()
            })
          }
          // }}}

          criterion.description = description
          criterion.section = section
          criterion.points = pointsNumber

          deferred.resolve()
        })


      return deferred.promise
    }

    // }}}

    let getCurrentFormattedTime = () => moment().format('dddd, MMMM DD, YYYY, h:mm A')

    let getCachedStudentById = (studentId) => {
      return _.first(_.where(cachedStudents, { _id: studentId }))
    }


    // Toggle Criterion {{{
    this.toggleCriterion = (studentId, criterion, groupId = null) => {
      const deferred = $q.defer()

      let pointsNumber = parseFloat(criterion.points)
      pointsNumber = _.isNaN(pointsNumber) ? 0 : pointsNumber

      const student = getCachedStudentById(studentId)
      if (!student.criterion_ids) {
        student.criterion_ids = []
      }
      if (!student.score) {
        student.score = 0
      }

      let selector = { _id: studentId }
      let docModifier = null
      // Add or remove criterion from student's criterion_ids
      const idx = _.indexOf(student.criterion_ids, criterion._id)
      if (idx === -1) {
        student.criterion_ids.push(criterion._id)
        student.score += pointsNumber
      } else {
        _.pullAt(student.criterion_ids, idx)
        student.score -= pointsNumber
      }
      student.modified = getCurrentFormattedTime()
      if (groupId) { // in case a group id is provided
        selector = { group_id: groupId }

        // update cache of group members
        const groupMembers = _.where(cachedStudents, { group_id: groupId })
        _.forEach(groupMembers, member => {
          member.criterion_ids = _.clone(student.criterion_ids)
          member.score = student.score
          member.modified = student.modified
        })
      }

      DatabaseContextService.getContext()
        .update(selector, {
          $set: {
            criterion_ids: student.criterion_ids,
            score: student.score,
            modified: getCurrentFormattedTime()
          }
        }, { multi: true }, (err, numChanged) => {
          if (err) {
            deferred.reject(err)
            console.log(err)
          } else {
            deferred.resolve(student)
          }
        })

      return deferred.promise
    }


    this.removeStudentFromGroup = (studentId, groupId) => {
      const deferred = $q.defer()

      let selector = null

      const groupMembers = _.where(cachedStudents, { group_id: groupId })
      if (groupMembers.length === 2) { // break group
        selector = { group_id: groupId }
        DatabaseContextService.getContext()
          .remove({ _id: groupId }, {}, (err, numChanged) => {})

        // update cache
        _.forEach(groupMembers, member => { delete member.group_id })
      } else {
        selector = { _id: studentId }

        // update cache
        const student = _.first(_.where(groupMembers, { _id: studentId }))
        delete student.group_id
      }

      DatabaseContextService.getContext()
        .update(selector, {
          $unset: { group_id: true }
        }, { multi: true }, (err, numChanged) => {
          if (err) {
            deferred.reject(err)
          } else {
            deferred.resolve(numChanged)
          }
        })

      return deferred.promise
    }

    this.insertStudents = (students) => {
      const deferred = $q.defer()

      DatabaseContextService.getContext()
        .insert(students, (err, newDocs) => {
          if (err) {
            deferred.reject(err)
          } else {
            deferred.resolve(newDocs.length)
          }
        })

      return deferred.promise
    }
    // }}}

    let openDatabase = (path) => {
      const deferred = $q.defer()
      const file = new nedb({ filename: path, autoload: true })
      file.loadDatabase((err) => {
        if (err) {
          deferred.reject(err)
        } else {
          deferred.resolve(db)
        }
      })
      return deferred.promise
    }


    let findAllCriteriaFromDatabase = (db) => {
      const deferred = $q.defer()

      db.find({ type: 'criterion' }, (err, criteria) => {
        if (err) {
          deferred.reject(err)
        } else {
          deferred.resolve(criteria)
        }
      })

      return deferred.promise
    }



    let importCriteria = (criteria) => {
      const deferred = $q.defer()

      const criteriaWithout_id = _(criteria).map(e => _.omit(e, '_id')).value()
      console.log(criteriaWithout_id)

      db.insert(criteriaWithout_id, function (err, newDocs) {
        if (err) {
          console.log(err)
          deferred.reject(err)
        } else {
          deferred.resolve(newDocs)
          cachedCriteria = null // invalidate cache
        }
      })
      return deferred.promise
    }



    this.importCriteriaFromJson = (path) => {
      const fs = require('fs')
      const content = fs.readFileSync(path, 'utf8')
      let criteria = []
      if (content) {
        // validJsonString = JSON.stringify(eval( `(${content})` ))
        criteria = JSON.parse(content)
      }
      return importCriteria(criteria)
    }

  } // end of DataService

}())
