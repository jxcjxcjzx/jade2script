/**
 * Created by zhengzk on 2016/1/13.
 */
var hasOwnProp = Object.prototype.hasOwnProperty;
/**
 * upperCase 首字母大写
 * @type {Function}
 */
exports.upperCase = upperCase = function(str){
    return str.replace(/(\w)/,function(v){
        return v.toUpperCase()
    });
};
/***
 * parseName
 * @param nameSpace
 * @returns {string}
 */
exports.parseName = function(nameSpace){
    var nameArr = (nameSpace || "").split(".");
    if(nameArr.length > 0){
        var  strArr = (nameArr[nameArr.length-1] || "").split("-");
        var last = '';
        for(var i = 0, l = strArr.length ; i < l ; i ++){
            last += upperCase(strArr[i]);
        }
        nameArr[nameArr.length-1] = last;
    }
    return nameArr.join('.');
}

/***
 * isFunction
 * @param fn
 * @returns {boolean}
 */
exports.isFunction = function (fn) {
    return '[object Function]' === Object.prototype.toString.call(fn);
}

/***
 * merge
 * @param first
 * @param second
 * @returns {*}
 */
exports.merge = function(first, second) {
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