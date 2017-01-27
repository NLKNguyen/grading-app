var gulp = require('gulp')
var sourcemaps = require('gulp-sourcemaps')
var babel = require('gulp-babel')
var concat = require('gulp-concat')

var ngAnnotate = require('gulp-ng-annotate') // Angular Dependency Injection

gulp.task('transpile', function () {
  var files = [
    'app/app.module.js',
    'app/app.routes.js',
    'app/app.extra.js',
    'app/shared/utility/**/*.js',
    'app/shared/database/**/*.js',
    'app/components/**/*.js'
  ]
  return gulp.src(files)
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat('transpiled.js'))
    .pipe(ngAnnotate())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build/app/'))
})

gulp.task('ngdocs', [], function () {
  var gulpDocs = require('gulp-ngdocs')
  return gulp.src('app/**/*.js')
    .pipe(gulpDocs.process())
    .pipe(gulp.dest('./docs'))
})
