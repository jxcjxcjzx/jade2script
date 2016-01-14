/**
 * Created by zhengzk on 2016/1/7.
 */
'use strict';
// import 载入外挂
var gulp = require('gulp'),
    rename = require('gulp-rename'),//重命名
    uglify = require('gulp-uglify'),//压缩
    concat = require('gulp-concat'), //合并
    StreamQueue = require('streamqueue'), //合并流等操作

    build = require("./tools/build");

var pkg = require('./package.json');


gulp.task('test', function () {
    //components.base = "test/src/templates/html/";
    var streamQueue = new StreamQueue({
        objectMode: true
    });
    //add client js lib
    streamQueue.queue(
        gulp.src('lib/**/*.js')
    );
    //parse jade to script
    streamQueue.queue(
        gulp.src(['demo/jade/**/*.jade'])
            .pipe(build.compile({
                //translate:function(data,name){
                //    return build.translate(data,name);
                //}
            }))
            .pipe(rename({
                extname:'.js'
            }))
            .pipe(gulp.dest('dest/_temp_/'))
    );

    //add exports
    streamQueue.queue(
        gulp.src(['demo/script/**/*.js'])
    );
    //concat & dest
    return streamQueue.done()
        .pipe(concat('main.js'))
        .pipe(build.addNote({
            name:'main',
            version:"0.0.1"
        }))
        .pipe(gulp.dest('dest'))
        .pipe(uglify({
            preserveComments: 'some'
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('dest/'))
});

gulp.task('default', function() {
    gulp.start('test');
});