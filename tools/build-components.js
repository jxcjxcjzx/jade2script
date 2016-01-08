/**
 * Created by zhengzk on 2016/1/7.
 */
var fs = require('fs'),
    jade2react  = require('../src/main');

//自定义的一些处理方法
var utils = require("./utils");

module.exports = function(options){
    return utils.modify(function(data,file){
        console.log(file.path);

        //rename
        //var _path = file.path.replace('.jade','.js');
        //fs.rename(file.path,_path,function(err){
        //    if(err){
        //        //重命名失败
        //    }
        //});
        return jade2react.compile(data,file.path);

        return "";
    });
}