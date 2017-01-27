#!/bin/sh

npm install --production
npm run bower-install
npm run gulp-transpile
