
const gulp = require('gulp');
const gutil = require('gutil');
const webpack = require('webpack');
const jasmine = require('gulp-jasmine');
const plumber = require('gulp-plumber');
const batch = require('gulp-batch');

let task = {
  webpack: (cb) => {
    const webpackConfig = require('./webpack.config');
    webpack(webpackConfig, (err, stats) => {
      gutil.log(stats.toString({ colors: true, chunks: false }));
      cb();
    });
  },

  jasmine: (cb) => {
    return gulp
      .src('spec/**/*.js')
      .pipe(jasmine())
  },

  watch: (cb) => {
    gulp.watch([
      'src/**/*.js',
      'spec/**/*.js'
    ], batch( (events, done) => {
      gulp.start('jasmine', done);
    }))
  },
}

for (let name in task) {
  gulp.task(name, task[name])
}

gulp.task('test', ['webpack', 'jasmine'])

