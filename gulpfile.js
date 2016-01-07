/**
 * Created by zhengzk on 2016/1/7.
 */
'use strict';
// import 载入外挂
var gulp = require('gulp'),
    rename = require('gulp-rename'),

    build = require("./tools/build-components"),
    jade2react  = require('./lib/server');

var pkg = require('./package.json'),
    components = require('./components.json');

gulp.task('components', function() {
    return gulp.src('src/templates/jade/**/*.jade')
        .pipe(build(components))
        .pipe(rename({
            extname: '.js'
        }))
        .pipe(gulp.dest('test/UItest/a/')); //
});


gulp.task('default', function() {
    gulp.start('components');
});