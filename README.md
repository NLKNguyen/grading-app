# Grading App
Cross-platform (offline/standalone) desktop application for grading students' assignments

**Note**: The source code will be available as soon as the refactoring process is complete. The codebase is now being rewritten to follow AngularJS [best practices](https://github.com/johnpapa/angular-styleguide). More documentation will come later.

I'm developing this software for a professor at CSU Fullerton to grade students' assignments in an Algorithm Engineering course. The first semester using it was a success: 3X speed up in grading and providing feedback to students.

This is built with [NW.js](https://github.com/nwjs/nw.js/) (previously known as Node-Webkit). It's a runtime based on Chromium and Node.js that allows web applications to run as native on multiple platforms (Mac OS X, Windows, Linux)

## Technology Stack

* Language: JavaScript, HTML, CSS

* Framework: [AngularJS 1.x](https://angularjs.org/) (Google's MVC front-end web framework)

* User Interface: [Angular Material](https://material.angularjs.org/) + [Material Design Lite](http://www.getmdl.io/)

* Database: [NeDB](https://github.com/louischatriot/nedb) (Embedded NoSQL datastore)

* Ultility: 
  * [LoDash](https://lodash.com/) (Awesome functional programming library for data manipulation)
  
  * [Babel](https://babeljs.io/) (ES2015 to ES5 transpiler)

  * [Gulp.js](https://github.com/gulpjs/gulp) (Streaming build system)
  
  * [CvsToJson](https://www.npmjs.com/package/csvtojson) (CVS to JSON converter)

## Screenshots

![Home](https://cloud.githubusercontent.com/assets/4667129/11984432/0d23a024-a970-11e5-8acc-024c297b7025.jpg)


![Details](https://cloud.githubusercontent.com/assets/4667129/11984434/0d2c5908-a970-11e5-9466-7e749c5edb72.jpg)


![Criteria](https://cloud.githubusercontent.com/assets/4667129/11984433/0d25c890-a970-11e5-95a4-c20fe7d316cb.jpg)


## Todo
* Soure code and build instruction
* End-user documentation
* Dev documentation
* Prebuilt distribution on different OSes

# License MIT
Copyright © 2015 Nguyen Nguyen
