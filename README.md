# Grading App
[![license](https://img.shields.io/github/license/NLKNguyen/grading-app.svg?maxAge=2592000)](https://github.com/NLKNguyen/grading-app/blob/master/LICENSE) [![](https://img.shields.io/github/issues-raw/NLKNguyen/grading-app.svg?maxAge=2592000)](https://github.com/NLKNguyen/grading-app/issues) [![](https://img.shields.io/github/issues-closed-raw/NLKNguyen/grading-app.svg?maxAge=2592000)](https://github.com/NLKNguyen/grading-app/issues)  [![Travis CI Build Status](https://travis-ci.org/NLKNguyen/grading-app.svg?branch=master)](https://travis-ci.org/NLKNguyen/grading-app)[![GitHub release](https://img.shields.io/github/release/NLKNguyen/grading-app.svg)](https://github.com/NLKNguyen/grading-app/releases)
<!--[![Github All Releases](https://img.shields.io/github/downloads/NLKNguyen/grading-app/total.svg)](https://github.com/NLKNguyen/grading-app/releases)-->


Cross-platform (offline/standalone) desktop application for grading students' assignments. Click & Run -- no additional softwares needed.

## Download prebuilt distributions
=> [https://github.com/NLKNguyen/grading-app/releases](https://github.com/NLKNguyen/grading-app/releases)

Available for **macOS** 64bit, **Linux** 32/64bit, and **Windows** 32/64bit

## Screenshots

![Home](https://cloud.githubusercontent.com/assets/4667129/22324558/efc739da-e35e-11e6-8cb7-24408adb706b.png)

![Menu](https://cloud.githubusercontent.com/assets/4667129/22324556/efc61032-e35e-11e6-8a4d-18c15adeaee6.png)

![Filter](https://cloud.githubusercontent.com/assets/4667129/22324554/efc32566-e35e-11e6-918b-f9ed7c4ef380.png)

![Details](https://cloud.githubusercontent.com/assets/4667129/22324555/efc51cd6-e35e-11e6-8066-b95fe6f9dd24.png)

![Summary](https://cloud.githubusercontent.com/assets/4667129/22324557/efc72972-e35e-11e6-881f-e323e6c3fc25.png)

![Criteria](https://cloud.githubusercontent.com/assets/4667129/22324559/efc83790-e35e-11e6-962c-149e7826b109.png)

DEVELOPMENT
===========

## Technology overview

This is built with [NW.js](https://github.com/nwjs/nw.js/) (previously known as Node-Webkit). It's a runtime based on Chromium and Node.js that allows web applications to run as native on multiple platforms (macOS, Linux, Windows)

* Language: JavaScript (ES2015), HTML, CSS

* Framework: [AngularJS 1.x](https://angularjs.org/) (Google's MVC front-end web framework)

* User Interface: [Angular Material](https://material.angularjs.org/) + [Material Design Lite](http://www.getmdl.io/)

* Database: [NeDB](https://github.com/louischatriot/nedb) (Embedded NoSQL datastore)

* Ultility: 
  * [LoDash](https://lodash.com/) (Awesome functional programming library for data manipulation)
  
  * [Babel](https://babeljs.io/) (ES2015 to ES5 transpiler)

  * [Gulp](https://github.com/gulpjs/gulp) (Streaming build system)
  
  * and others

The codebase follows AngularJS 1.x [best practices](https://github.com/johnpapa/angular-styleguide)

---
## Build

2 ways

#### Directly on your terminal
Require Node.js and NPM to be available.

At project directory
```
$ npm install --production
$ npm run bower-install
$ npm run gulp-transpile
```

#### Or using nwjs-project Docker image
All you need is `Docker` and no other development programs are required on your machine. The Docker container already has Node.js and NPM as well as other utilities.

At project directory:
```
$ docker run --rm -it -v $(pwd):/mnt nlknguyen/nwjs-project --shell
```
*Explain*: // TODO

*Note for Windows*: // TODO

Once you are inside the container shell, run build commands normally like above:
```
$ npm install --production
$ npm run bower-install
$ npm run gulp-transpile
```

----

## Install NW.js

2 ways
#### Normally
This is a typical NW.js app, so you can follow [NW.js documentation](http://docs.nwjs.io/en/latest/For%20Users/Getting%20Started/#get-nwjs) to install NW.js.

#### Or using nwjs-project Docker image

The [nwjs-project](https://hub.docker.com/r/nlknguyen/nwjs-project/) Docker image includes NW.js runtime binaries for all supported architectures. The following command will bring the target runtime to your project directory under a subdirectory `nwjs-sdk`
```
$ docker run --rm -v $(pwd):/mnt nlknguyen/nwjs-project --nwjs-sdk="[ARCH]"
```

Where `[ARCH]` can be one or many of `win-x64 win-ia32 linux-x64 linux-ia32 osx-x64` (separated by a space)

For example, on macOS you will do: 
```
$ docker run --rm -v $(pwd):/mnt nlknguyen/nwjs-project --nwjs-sdk="osx-x64"
```

----

## Run

At project directory
```  
$ [path to NW.js binary] .
```

If you use the above Docker image, a shortcut is already added to your directory so you can just double click on it. For example, it will be something like `nwjs-sdk.linux-x64.desktop` for Linux architecture or `nwjs-sdk.osx-x64.command` for macOS architecture.

## Package

You can package it just like any other NW.js app (see [documentation](http://docs.nwjs.io/en/latest/For%20Users/Package%20and%20Distribute/)). Or simply use nwjs-project Docker image to package for different OSes automatically.
```
$ docker run --rm -v $(pwd):/mnt nlknguyen/nwjs-project --package="[ARCH]" --name="grading-app"
```

Where `[ARCH]` can be one or many of `win-x64 win-ia32 linux-x64 linux-ia32 osx-x64` (separated by a space). Without specifiying the architectures (i.e. `--package` only), it will package for all architectures.

The distributions are located in `release` subdirectory, and they are all zipped.

## CI/CD

// TODO: explain later

## Todo
* End-user documentation
* Dev documentation

# License MIT
Copyright © 2015-2016 Nguyen Nguyen
