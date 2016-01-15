jade2script
==========

A jade to client javascript compiler tool / 一种利用jade模板生成客户端javascript组件的编译工具

## installation
jade2script is a registered npm module. So you can install it using the following command:
```
npm install jade2script
```

推荐使用gulp 可参照demo进行编写

## 应用指南
该项目目前应用于[Verge Video Player](https://github.com/vergeplayer/vvp)的组件编译

如果需要在客户端使用 需引用[lib/client_base.js](./lib/client_base.js)模块

## Demo
完整实例见代码 

* input:
** main.jade
```jade
.main
    include view/hello-world
```
** view\hello-world.jade
```jade
.main
    include view/hello-world
```

* output:
```js
//base lib code

base.routes("Main",true);
Main = function(options){
	var frag = document.createDocumentFragment();
	var  fc_0 = base.create('div',{"className":'main'});
	var fc_0_0 = new view.HelloWorld();
	fc_0.append(fc_0_0.fragment);
	frag.appendChild(fc_0);
	return frag;
};

base.routes("view.HelloWorld",true);
view.HelloWorld = function(options){
	var frag = document.createDocumentFragment();
	var  fc_0 = base.create('span',{"className":'hello'});
	fc_0.html('helloWorld!');
	frag.appendChild(fc_0);
	this.fragment = frag;
	return frag;
};
```

相关构建脚本:
[gulpfile.js](./gulpfile.js)
[tools/build.js](./tools/build.js) 
     
## 实现参照
+ [jade2react](https://github.com/VanCoding/jade2react)

## maybe you need ? 
+ [json2script](https://github.com/zhengzk/json2script) parse json to script
+ [html2script](https://github.com/zhengzk/html2script) parse html to script

License
-------

The MIT License (MIT), read [LICENSE](./LICENSE) for more information

