/*
 * touchgo 1.0
 *
 * author tong
 * Copyright 2014
 *
 */


var TouchGo = function(con, nav) {
    //通用函数
    var comf = {
        doc: document,
        bind: function(obj, fun, args) {
            var _args = args;
            return function() {
                fun.call(obj, _args);
            }
        },
        getElesByClass: function(className) {
            if (comf.doc.getElementsByClassName) {
                return comf.doc.getElementsByClassName(className);
            } else if (comf.doc.querySelectorAll) {
                return comf.doc.querySelectorAll(className);
            } else {
                return [];
            }
        },
        getEleById: function(id) {
            return comf.doc.getElementById(id);
        },
        getChildren: function(obj) {
            var childNodes = obj.childNodes,
                children = [];
            if (obj.children) {
                return obj.children;
            }
            for (var i = 0, j = childNodes.length; i < j; i++) {
                if (childNodes[i].nodeType === 1) {
                    children.push(childNodes[i]);
                }
            }
            return children;
        },
        nextSibling: function(obj) {
        	if(obj.nextElementSibling){
        		return obj.nextElementSibling;
        	}else if(obj.nextSibling && obj.nextSibling.nodeType === 1) {
                return obj.nextSibling;
            } else {
                if (!obj.nextSibling) {
                    return;
                }
                return arguments.callee(obj.nextSibling);
            }
        },
        addEvent: function(obj, type, fun) {
            obj.addEventListener(type, fun, false);
        },
        removeEvent: function(obj, type, fun) {
            obj.removeEventListener(type, fun, false);
        },
        preventDefault: function(event) {
            if (event.preventDefault) {
                event.preventDefault();
            }
        },
        getComputedStyles: function(element) {
            if (document.defaultView && document.defaultView.getComputedStyle) {
                return document.defaultView.getComputedStyle(element, null);
            } else if (element.currentStyle) { //IE
                return element.currentStyle;
            }
        }
    };
    //开始滑动
    function touchStart(event) {
        comf.preventDefault(event);
        var touchs = event.touches[0];
        start.X = touchs.pageX,
        start.Y = touchs.pageY;
        for (var i = 0, j = slides.length; i < j; i++) {
            comf.addEvent(slides[i], "touchmove", touchMove);
            comf.addEvent(slides[i], "touchend", touchEnd);
        }
    }
    //touchMove
    function touchMove() {
        comf.preventDefault(event);
        var touchs = event.touches[0],
            moveX = touchs.pageX,
            moveY = touchs.pageY,
            differ = Math.abs(moveX - start.X),
            index = con.getAttribute("index");
        dir = "-"; //- left; + right;

        // var transformXY = ele.style.webkitTransform.match(reg);//结果 [20,-20]
        // if(!transformXY){
        //   transformXY = [0,0];
        // }
        ele.style.webkitTransition = "none";
        (moveX < start.X ? dir = "-" : dir = "+");
        //第一个往右和最后一个往左时return
        if ((index == 0 && dir == "+") || (index == size - 1 && dir == "-")) {
            //第一个往右和最后一个往左最大可再滑动最大20
            ele.style.webkitTransform = "translate(" + dir + (slideW * Number(index) + (differ > 20 ? 20 : differ)) + "px,0)";
            return;
        }
        if (dir === "+") {
            ele.style.webkitTransform = "translate(" + (end.X + differ) + "px,0)";
        } else {
            ele.style.webkitTransform = "translate(" + (end.X - differ) + "px,0)";
        }
    }
    //停止滑动
    function touchEnd() {
        comf.preventDefault(event);
        var touchs = event.changedTouches[0],
            endX = touchs.pageX,
            endY = touchs.pageY,
            differ = endX - start.X,
            index = con.getAttribute("index");
        dir = "-"; //- left; + right;

        // var transformXY = ele.style.webkitTransform.match(reg);//结果 [20,-20]
        // if(!transformXY){
        //   transformXY = [0,0];
        // }
        ele.style.webkitTransition = "all .5s";
        (endX < start.X ? dir = "-" : dir = "+");
        //第一个往右和最后一个往左时return
        if ((index == 0 && dir == "+") || (index == size - 1 && dir == "-")) {
            ele.style.webkitTransform = "translate(" + dir + slideW * Number(index) + "px,0)";
            return;
        }
        if (refDis < Math.abs(differ)) {
            if (dir === "+") {
                ele.style.webkitTransform = "translate(" + "-" + slideW * (Number(index) - 1) + "px,0)";
                end.X = Number("-" + slideW * (Number(index) - 1));
                setIndex(Number(index) - 1);
                moveNavs(Number(index) - 1);
            } else {
                ele.style.webkitTransform = "translate(" + dir + slideW * (Number(index) + 1) + "px,0)";
                end.X = Number(dir + slideW * (Number(index) + 1));
                setIndex(Number(index) + 1);
                moveNavs(Number(index) + 1);
            }
        } else {
            ele.style.webkitTransform = "translate(" + dir + slideW * Number(index) + "px,0)";
        }

        for (var i = 0, j = slides.length; i < j; i++) {
            comf.removeEvent(slides[i], "touchmove", touchMove);
            comf.removeEvent(slides[i], "touchend", touchEnd);
        }
    }
    //滚动
    function moveNavs(index) {
    	navs = comf.getChildren(nav);
    	for (var i = 0, j = slides.length; i < j; i++) {
    		if(i != index){
    			var cl = navs[i].className;
    			if(/c/.test(cl)){
    				navs[i].className = cl.replace("c","");
    			}
    		}else{
    			navs[i].className += " c";
    		}
    	}
    }

    function setIndex(i) {
        con.setAttribute("index", i);
    }

    function getIndex() {
        return Number(con.getAttribute("index"));
    }
    //初始化
    function init() {
        //nav = this.nav;
        var navb="";
        slideW = parseInt(comf.getComputedStyles(con)["width"].replace("px", ""));
        ele.style.width = slideW * slides.length + "px";
        for (var i = 0, j = slides.length; i < j; i++) {
            slides[i].style.width = slideW + "px";
        }
        setIndex(0);
        //navchildren = this.comf.getChildren(nav);
        for (var i = 0, j = slides.length; i < j; i++) {
            comf.addEvent(slides[i], "touchstart", touchStart);
            //comf.addEvent(slides[i], "touchmove", touchMove);
            //comf.addEvent(slides[i], "touchend", touchEnd);
            //动态nav的li
            if(i==0){
            	navb += "<b class=' c'></b>";
            }else{
            	navb += "<b></b>";
            }
        }
        nav.innerHTML = navb;
    }
    //承载滚动图片的控件
    // div ul li
    var con = comf.getElesByClass(con)[0], //div
        ele = comf.getChildren(con)[0], //ul
        slides = comf.getChildren(ele), //li
        size = slides.length, //子对象的个数   
        slideW, //img width
        //和图片一起滚动的trigger
        nav = ele.nextElementSibling.className.indexOf("nav")>-1?ele.nextElementSibling:comf.getElesByClass("nav")[0],
        navs,
        index = 0, // 滚动到第几个
        refDis = 50, // 滑动距离，》=50后滚动
        reg = /\-?[0-9]+\.?[0-9]*/g; // 匹配transform

    var start = {
            X: 0, //开始位置x
            Y: 0 //开始位置y
        },
        end = {
            X: 0, //结束位置x
            Y: 0 //结束位置y
        }

    return init();
};
