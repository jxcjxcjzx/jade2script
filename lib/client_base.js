
/**
 * 运行在客户端时的基础公共方法
 * require jQuery or Zepto
 * Copyright 2016, client_base.js
 * MIT Licensed
 * @since 2016/01/12.
 * @modify 2016/01/14.
 * @author zhengzk
 **/
var base = {
    /**
     * 根据path创建路径
     * @param path string
     * @param flag boolean
     * @returns {Object}
     */
    routes: function (path,flag) {
        var arr = path.split('.');
        var length = arr.length;
        if(flag==true) length--;
        if (length <= 0) return;

        var i = 1;
        var ns = arr[0];
        do {
            eval('if(typeof(' + ns + ') == "undefined") ' + ns + ' = new Object();');
            ns += '.' + arr[i++];
        } while (length >= i);
        return eval(ns);
    },
    /**
     * 创建一个DOM元素并转换为jQuery对象
     * @param tagName
     * @param attrs
     */
    create: function (tagName, attrs) {
        tagName = tagName || 'div';
        var ele = document.createElement(tagName);
        var ret = jQuery(ele);
        if (attrs) {
            ret.attr(attrs);
        }
        //ret.attr(attrs);
        return ret;
    },
    /**
     * 把style属性转换成object
     * @param style
     * @returns {*}
     */
    mapStyle:function(style){
        if(typeof style == "object") return style;
        var defs = (style+"").split(";");
        style = {};
        for(var def in defs){
            def = defs[def].split(":");
            style[def[0]] = def[1];
        }
        return style;
    },
    /**
     * render
     * @param self
     * @param renderBody
     * @returns {Array}
     */
    render:function(self,renderBody){
        var children = [];
        renderBody.call(self,function(component,attributes,sub){
            if(component instanceof Function){
                children.push(component.apply(component,sub?[attributes].concat(render(self,sub)):[attributes]));
            }else{
                children.push(component);
            }
        });
        return children;
    },
    /**
     * mixin
     * @param source
     * @param target
     */
    mixin:function(source,target){
        for(var key in source){
            target[key] = source[key];
        }
    },
    /**
     * mixinAttributes
     * @param target
     * @param blocks
     * @returns {*}
     */
    mixinAttributes:function (target,blocks){
        for(var i = 0; i < blocks.length; i++){
            verge.mixin(blocks[i],target);
        }
        return target;
    }
};