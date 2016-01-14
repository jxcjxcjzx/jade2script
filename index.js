'use strict';

var fs = require("fs"),
    path = require('path'),

    Compilation = require("./src/compilation"),
    utils = require("./src/utils"),

    config = require("./config.json");

/***
 * compile
 * @param str
 * @param options
 * @returns {*}
 */
exports.compile = function(str,options){
    if(!options.name){
        throw new Error('Please set name!');
    }
    options.name = utils.parseName(options.name);
    options.parseName = options.parseName || function(path){
        path = path.replace('../','');
        path = path.replace('./','');
        var nameArr = options.name.split('.');
        var prefix = nameArr.slice(0,nameArr.length-1).join('.');
        prefix = prefix ? prefix + "." : "";
        return  prefix + utils.parseName(path.replace(/\//g,'.'));
    };
    options = utils.merge(config,options);
    return new Compilation(str,options).compile();
};

/**
 * compile from File
 * @param file
 * @param options
 * @returns {*}
 */
exports.compileFile = function(file,options){
    return module.exports.compile(fs.readFileSync(file)+"",utils.merge({
        name:path.basename(file.relative,".jade").replace(/\\/g,'.')
    },options));
}

//require.extensions[".jade"] = function(m,file){
//    m._compile(module.exports.compileFile(file),file);
//}

