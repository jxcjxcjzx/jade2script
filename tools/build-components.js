/**
 * Created by zhengzk on 2016/1/7.
 */
var fs = require('fs'),
    jade2script  = require('../src/main');

//自定义的一些处理方法
var utils = require("./utils");

module.exports = function(options){
    console.log('options:',options);
    return utils.modify(function(data,file){
        console.log(file.path);

        //rename
        //var _path = file.path.replace('.jade','.js');
        //fs.rename(file.path,_path,function(err){
        //    if(err){
        //        //重命名失败
        //    }
        //});

        return jade2script.compile(data,utils.merge(options,{filePath:file.path}));

        return "";
    });
}