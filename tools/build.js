/**
 * gulp 自定义任务
 * Copyright 2015, player.js
 * MIT Licensed
 * @since 2015/9/8.
 * @modify 2015/9/8.
 * @author zhengzk
 **/
var through2 = require('through2'),
    path = require('path'),

    hasOwnProp = Object.prototype.hasOwnProperty,

    jade2script  = require('../index'),
    pkg = require('../package.json');



/**
 * 将流转换为字符串进行处理
 * @param modifier function
 **/
function modify(modifier) {
    return through2.obj(function (file, encoding, cb) {
        var content = modifier(String(file.contents),file);
        //var content = modifier(String(file.contents));
        file.contents = new Buffer(content);
        //this.push(file);
        cb(null, file);
    });
}

/**
 * merge
 * @param first
 * @param second
 * @returns {*}
 */
function merge(first, second) {
    if (!second) {
        return first;
    }
    for (var key in second) {
        if (hasOwnProp.call(second, key)) {
            first[key] = second[key];
        }
    }
    return first;
};


/**
 * 添加版本信息等
 * @param data
 * @param options
 * @returns {*}
 * */
var addNote = function (data,options) {
    options = options || {};
    var timeStr = ( new Date() ).toISOString().replace( /:\d+\.\d+Z$/, "Z" );
    var name = options.name || pkg.name;
    var version = options.version || pkg.version;
    //var global = options.global || 'window';

    return '/*!' + name + ' <' + version + '@' + timeStr + '> */\n'
            + '(function(exports,jQuery,undefined){\n'
            + data
            + '}(window,jQuery));';
};


exports.addNote = function(options){
    return modify(function(str){
        return addNote(str,options);
    });
};

exports.compile = function(options){
    //console.log('options:',options);
    return modify(function(data,file){
        //console.log('file:',file.relative);
        return jade2script.compile(data,
            merge(options,{
                name:file.relative.replace('.jade','').replace(/\\/g,'.')//path.basename(file.relative,".jade").replace(/\//g,'.')
            })
        );
    });
};

exports.translate = function(data,name){
    return "vvp.CoreObject.extend({\n"
        +"\t init:function(options){\n"
        +"\t\t this.options = options || {};\n"
        +"\t\t this.fragment = this._createView(options);\n"
        +"\t},\n"
        +"\t _createView:"
        + data
        + "});\n"
};