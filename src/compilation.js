var parse = require("jade-parser");
var lex = require("jade-lexer");
var Block = require("./block.js");
var tags = "a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn dialog div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hr html i iframe img input ins kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track u ul var video wbr circle defs ellipse g line linearGradient mask path pattern polygon polyline radialGradient rect stop svg text tspan".split(" ");

function Compilation(doc,path){
    this.path = path;
    this.tree = parse(lex(doc)).nodes;
    this.extendBlock1 = new Block();
    this.extendBlock2 = new Block();
    this.main = new Block();
    this.mixins = new Block();
    this.script = new Block();
    this.extendblock = new Block();
    this.blocks = new Block();
    this.block = this.main;
    this.blocklist = {};
}

Compilation.prototype = Object.create(Block.prototype);

Compilation.prototype.compile = function(){
    this.deblock(this.tree);
    this.tree.forEach(function(node){
        if(node.type == "Tag" && node.name == "script") node.name = "main";
    });
    this.block.writeLine("/**View Component**/");
    this.block.writeLine("vvp.ui.Component = vvp.CoreObject.extend({",1);
    this.block.writeLine("init:function(data,options){",1);
    this.block.writeLine("this.data = data || {};//The Component data");
    this.block.writeLine("this.options = options || {};//The Component props");
    this.block.writeLine("this.eles = [];");
    this.block.writeLine("this.fragment = this._createView();");
    this.block.indent(-1);
    this.block.writeLine("},");
    this.block.writeLine("/**createView**/");
    this.block.writeLine("_createView:function(){",1);
    this.block.writeLine("var frag = document.createDocumentFragment();");


    this.block.writeBlock(this.extendBlock1);


    //this.block.writeLine("var React = require(\"react\");");
    //this.block.writeLine("var jade2react = require(\"jade2react\");");
    this.block.writeLine("");
    //this.block.writeLine("var Component = module.exports = function Component(){",1);


    //console.log(this.extendBlock1);

    //this.block.writeLine("this.state = this.getInitialState?this.getInitialState():{};",-1);
    //this.block.writeLine("}");
    this.block.writeBlock(this.extendBlock2);
    //this.block.writeLine("Component.prototype._render = function(__add){",1);
    //this.renderNodes(this.tree,true);
    this.renderNodes(this.tree);
    if(this.extendBlock1.out.length){
        this.block.writeLine("Component.prototype.__proto__._render.call(this,__add);");
    }
    //this.block.indent(-1);
    //this.block.writeLine("}");
    //this.block.writeLine("Component.prototype.render = function(){",1);
    //this.block.writeLine("return jade2react.render(this,this._render)[0];",-1);
    //this.block.writeLine("}");
    //this.block.writeLine("");

    console.log('a:',this.blocklist);
    for(var block in this.blocklist){
        var b = this.blocklist[block];
        this.block.writeLine("Component.prototype."+block+" = function(__add){",1);
        if(b.prepend){
            this.renderNodes(b.prepend.nodes,block + "_pre_");
        }
        if(b.replace){
            this.renderNodes(b.replace.nodes,block + "_rep_");
        }else{
            this.block.writeLine("Component.prototype.__proto__."+block+".call(this,__add);");
        }
        if(b.append){
            this.renderNodes(b.append.nodes,block + "_");
        }
        this.block.indent(-1);
        this.block.writeLine("}");
    }
    this.block.writeLine("")
    this.block.writeBlock(this.mixins);
    this.block.writeLine("");
    this.block.writeBlock(this.script);

    //if(!this.extendBlock1.out.length){
    //    this.renderExtends()
    //}

    //end:_createView
    this.block.writeLine("return frag;");
    this.block.indent(-1);
    this.block.writeLine("}");
    //end:vvp.CoreObject.extend
    this.block.indent(-1);
    this.block.writeLine("});");

    var code = this.block.build();
    //console.log(code);
    return code;
}

Compilation.prototype.deblock = function(nodes){
    for(var i = 0; i < nodes.length; i++){
        var node = nodes[i];
        if(node.block) node.nodes = node.block.nodes;
        if(node.nodes) this.deblock(node.nodes);
    }
}

Compilation.prototype.renderNode = function(node,varName,parent){ //Variable
    var _append_flag = false;

    switch(node.type){
        case "Text":
        case "Code":
        case "Tag":
        case "Block":
        case "Each":
        case "Comment":
        case "BlockComment":
        case "Case":
        case "When":
        case "Mixin":
        case "MixinBlock":
        case "Extends":
        case "NamedBlock":
            _append_flag = this["render" + node.type](node,varName,parent);
            break;
    }
    if(!_append_flag){
        this.block.writeLine( parent ? (parent + ".append("+ varName +");"):"frag.appendChild("+ varName +");");
    }
}

Compilation.prototype.renderNodes = function(nodes,prefix){
    for(var i = 0; i < nodes.length; i++){
        var _prefix = (prefix || 'fc') + "_" + i;
        this.renderNode(nodes[i],_prefix,prefix);
    }
}

Compilation.prototype.renderText = function(node,varName,parent){
    //console.log('Text:',node);
    if(!node.val) return;
    var val = node.val;
    var variables = val.match(/!{\w{1,}}/g);
    if(variables){
        for(var k in variables){
            var _var = variables[k];
            val.replace(_var,"\'+"+_var.match(/\w{1,}/)[0] +"+'");
        }
    }

    //console.log(node);
    this.block.writeLine( parent  +".html(\'"+node.val+"\');");
    return true;
}

Compilation.prototype.renderCode = function(node,varName,parent){
    console.log('Code:',node);
    if(!node.val) return;
    //console.log(node);
    if(node.block){
        this.block.writeLine(node.val+"{",1);
        this.renderNodes(node.block.nodes);
        this.block.indent(-1);
        this.block.writeLine("}");
    }else if(node.buffer){
        this.block.writeLine( parent  +".html(\'"+node.val+"\');");
        //this.block.writeLine("__add("+node.val+");");
    }else{
        this.block.writeLine(node.val);
        return true;//非DOM结点
    }
}

Compilation.prototype.renderTag = function(node,varName,parent){
    //console.log('Tag:',node);
    if(node.name=="main"){
        for(var i = 0; i < node.nodes.length; i++){
            switch(node.nodes[i].type){
                case "Text":
                    this.script.writeLine(node.nodes[i].val);
                    break;
                case "NewLine":
                    this.script.writeLine();
                    break;
            }

        }
    }else if(node.name == "children"){
        this.block.writeLine("for(var i = 0; i < this.props.children.length; i++){",1);
        this.block.writeLine("__add(this.props.children[i]);",-1);
        this.block.writeLine("}");
    }else{
        var isDOM = tags.indexOf(node.name)>=0;
        var isComponent = false;
        //this.block.write("__add(React.createFactory("+(isDOM?"'":"")+node.name+(isDOM?"'":"")+"),");

        var _varName = varName || "root";
        if(isDOM){//Dom节点
            this.block.write("var  " + _varName + " = verge.create(\'"+node.name + "\',");//verge.create('div',
        }else{//Component
            this.block.write("var  " + _varName + " = new " + node.name + "(");//new Aaa(
            var isComponent = true;
        }

        if(node.code && node.code.val){
            node.nodes.unshift(node.code)
        }
        if(node.name == "script" || node.name == "style"){
            var script = [];
            for(var i = 0; i < node.nodes.length; i++){
                switch(node.nodes[i].type){
                    case "Code":
                        script.push(node.nodes[i].val);
                        break;
                    case "Text":
                        script.push("\""+node.nodes[i].val.replace(/"/g,"\\\"")+"\"");
                        break;
                    case "NewLine":
                        script.push("\"\\r\\n\"");
                        break;
                }
            }
            script = script.join(" + ");
            if(script){
                node.attrs.push({
                    name:"dangerouslySetInnerHTML",
                    val:"{__html:"+script+"}"
                })
            }
            node.nodes = [];
        }
        this.renderAttributes(node);
        this.block.writeLine(");");
        if(isComponent){
            this.block.writeLine(parent + ".append(" + varName +".fragment);");
        }

        if(node.nodes.length){
            //this.block.writeLine(",function(__add){",1);
            this.renderNodes(node.nodes,_varName);
            //this.block.indent(-1);
            //this.block.writeLine("});");
        }else{
            //this.block.writeLine(");");
        }

        return !isDOM;
    }
}

Compilation.prototype.renderBlock = function(node){
    this.renderNodes(node.nodes);
}

Compilation.prototype.renderAttributes = function(node){
    if(node.attrs){
        var attributes = {};
        for(var i = 0; i < node.attrs.length; i++){
            var att = node.attrs[i];
            if(attributes[att.name] && att.name == "class"){
                attributes[att.name] += " + \" \" + "+att.val;
            }else{
                attributes[att.name] = att.val;
            }
        }

        if(attributes.class){
            attributes.className = attributes.class;
            delete attributes.class;
        }
        if(node.attributeBlocks.length) this.block.write("jade2react.mixinAttributes(");
        var first = true;
        this.block.write("{");
        for(var att in attributes){
            //this.block.write((first?"":",")+'"'+att+'":'+(att=="style"?"jade2react.mapStyle(":"")+attributes[att]+(att=="style"?")":""));
            this.block.write((first?"":",")+'"'+att+'":'+(att=="style"?"jade2react.mapStyle(":"")+attributes[att]+(att=="style"?")":""));
            first = false;
        }
        this.block.write("}");
        if(node.attributeBlocks.length) this.block.write(",["+node.attributeBlocks.join(",")+"])");
    }else{
        this.block.write("{}");
    }
}

Compilation.prototype.renderEach = function(node){
    this.block.writeLine("for(var "+(node.key||"__key")+" in "+node.obj+"){",1);
    if(node.val){
        this.block.writeLine("var "+node.val+" = "+node.obj+"["+(node.key||"__key")+"];");
    }
    this.renderNodes(node.nodes);
    this.block.indent(-1);
    this.block.writeLine("}");
}

Compilation.prototype.renderComment = function(node){
    this.block.writeLine("//"+node.val)
}

Compilation.prototype.renderBlockComment = function(node){
    this.block.writeLine("/*",1);
    for(var i = 0; i < node.nodes.length; i++){
        this.block.writeLine(node.nodes[i].val);
    }
    this.block.indent(-1);
    this.block.writeLine("*/");
}

Compilation.prototype.renderCase = function(node){
    this.block.writeLine("switch("+node.expr+"){",1);
    this.renderNodes(node.nodes);
    this.block.indent(-1);
    this.block.writeLine("}");
}

Compilation.prototype.renderWhen = function(node){
    //console.log('When:',node);
    this.block.writeLine("case "+node.expr+":",1);
    if(node.nodes){
        this.renderNodes(node.nodes);
        this.block.writeLine("break;");
    }
    this.block.indent(-1);
}

Compilation.prototype.renderMixin = function(node){
    console.log('Mixin:',node);
    if(node.call){
        this.block.write("this."+node.name+"(");
        if(node.nodes){
            this.block.writeLine("jade2react.render(this,function(__add){",1);
            this.renderNodes(node.nodes);
            this.block.indent(-1);
            this.block.write("}),");
        }else{
            this.block.write("[],");
        }
        this.renderAttributes(node);
        this.block.writeLine(","+node.args+").forEach(__add);");
    }else{
        var prev = this.block;
        this.block = new Block();
        this.mixins.writeBlock(this.block);

        if(node.args){
            var argparts = node.args.split("...");
            argparts[0] = argparts[0].trim();
            if(argparts[0][argparts[0].length-1] == ","){
                argparts[0] = argparts[0].slice(0,-1);
            }
            argparts[0] = ","+argparts[0];
        }else{
            argparts = [""];
        }

        this.block.writeLine("Component.prototype."+node.name+" = function(block,attributes"+argparts[0]+"){",1);
        if(argparts.length > 1){
            this.block.writeLine("var "+argparts[1].trim()+" = Array.prototype.slice.call(arguments,"+argparts[0].split(",").length+");");
        }
        this.block.writeLine("return jade2react.render(this,function(__add){",1);
        this.renderNodes(node.nodes)
        this.block.indent(-1);
        this.block.writeLine("});");
        this.block.indent(-1);
        this.block.writeLine("}");
        this.block = prev;
    }
}

Compilation.prototype.renderMixinBlock = function(node){
    console.log('MixinBlock:',node);
    this.block.writeLine("block.forEach(__add)")
}

Compilation.prototype.renderExtends = function(node){
    console.log('Extends:',node);
    var baseComponent = (node?("require(\""+node.path+"\")"):"React.Component");
    this.extendBlock1.writeLine(baseComponent+".call(this);");
    this.extendBlock2.writeLine("Component.prototype = Object.create("+baseComponent+".prototype);");
}

Compilation.prototype.renderNamedBlock = function(node,varName,parent){
    console.log('NamedBlock:',node);
    if(!this.blocklist[node.name]) this.blocklist[node.name] = {};
    this.blocklist[node.name][node.mode||"replace"] = node;
    if(node.mode == "replace" || node.mode === undefined){
        this.block.writeLine("this."+node.name+"(__add);")
    }
}

module.exports = Compilation;
