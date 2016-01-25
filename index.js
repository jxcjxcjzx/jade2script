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
    var _options = initOptions(options);
    return new Compilation(str,_options).compile();
};

function processModule(node,varName,name){
    var nameArr = name.split('.');
    var prefix = nameArr.slice(0,nameArr.length-1).join('.');
    prefix = prefix ? prefix + "." : "";
    var _name = utils.parseName(prefix + node.file.path.split("/").join("."));
    return 'var ' + varName + " = new "+ _name + "();"
    return _name;
}

function translate(data,name){
    return name + " = " + data;
}

function initOptions(options){
    if(!options.name){
        throw new Error('Please set name!');
    }
    var base = options.utils || "base";

    var _options = utils.merge(config,options);
    var _name = utils.parseName(options.name);
    return utils.merge(_options,{
        name:_name,
        processModule:function(_path,varName){
            var _str = utils.isFunction(options.processModule)?options.processModule(_path,varName):processModule(_path,varName,_name);
            return _str;
        },
        translate:function(data,name){
            var _text = (_options.routes && name.indexOf('.') >= 0) ? base + '.routes("' + name + '",true);\n' :'';
            _text += utils.isFunction(options.translate)?options.translate(data,name):translate(data,name);
            return _text;
        }
    });


    //options
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
    return _options;
}

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

exports.parseName = utils.parseName;
//require.extensions[".jade"] = function(m,file){
//    m._compile(module.exports.compileFile(file),file);
//}

