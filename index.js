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
    var _options = utils.merge(config,options);
    _options.name = utils.parseName(options.name);
    if(utils.isFunction(options.parseName)){
        var _parseName = options.parseName;
        _options.parseName = function(_path){
            return utils.parseName(_parseName(_path));
        }
    }else{
        _options.parseName = function(_path){
            var nameArr = options.name.split('.');
            var prefix = nameArr.slice(0,nameArr.length-1).join('.');
            prefix = prefix ? prefix + "." : "";
            return utils.parseName(prefix + _path.split("/").join("."));
        }
    }
    return new Compilation(str,_options).compile();
};

/**
 * compile from File
 * @param _path
 * @param options
 * @returns {*}
 */
exports.compileFile = function(_path,options){
    //var absPath =  _path;
    var relPath = _path;
    if(path.isAbsolute(_path)){
        relPath = path.relative(process.cwd(), _path);
    //}else{
        //absPath = path.join(process.cwd(), _path);
    }
    //var fileName = path.basename(_path,".jade");

    return module.exports.compile(fs.readFileSync(relPath)+"",utils.merge({
        name:relPath.split(path.sep).join(".")   //file.relative.replace(".jade","").replace(/\//g,'.')
    },options));
}

//require.extensions[".jade"] = function(m,file){
//    m._compile(module.exports.compileFile(file),file);
//}

