/**
 * Created by zhengzk on 2016/1/7.
 */
'use strict';
// import 载入外挂
var gulp = require('gulp'),
    rename = require('gulp-rename'),

    build = require("./tools/build-components");

var pkg = require('./package.json');
    //components = require('./components.json');

gulp.task('components', function() {
    return gulp.src('test/src/templates/jade/**/*.jade')
        .pipe(build({}))//components
        .pipe(rename({
            extname: '.js'
        }))
        .pipe(gulp.dest('test/UItest/a/')); //
});

gulp.task('test', function() {
    return gulp.src('test/src/templates/jade/index.jade')
        .pipe(build({}))//components
        .pipe(rename({
            extname: '.js'
        }))
        .pipe(gulp.dest('test/UItest/a/')); //
});


gulp.task('default', function() {
    gulp.start('components');
});