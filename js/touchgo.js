/*
 * touchgo 1.0
 *
 * author tong
 * Copyright 2014
 *
 */


var TouchGo = function(container, options) {
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
            if (obj.nextElementSibling) {
                return obj.nextElementSibling;
            } else if (obj.nextSibling && obj.nextSibling.nodeType === 1) {
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
        clearTimeout(timer);
        clearTimeout(timerRe);
        comf.preventDefault(event);
        var touchs = event.touches[0];
        start.X = touchs.pageX,
        start.Y = touchs.pageY;
    }
    //滑动
    function touchMove() {
        ele.style.webkitTransition = "none";
        comf.preventDefault(event);
        var touchs = event.touches[0],
            moveX = touchs.pageX,
            moveY = touchs.pageY,
            differ = Math.abs(moveX - start.X),
            index = getIndex(),
            dir = "-"; //- left; + right;

        (moveX < start.X ? dir = "-" : dir = "+");
        //当不循环时,第一个往右和最后一个往左时return
        if (!loop) {
            if ((index == 0 && dir == "+") || (index == size - 1 && dir == "-")) {
                //第一个往右和最后一个往左最大可再滑动20
                ele.style.webkitTransform = "translate(" + dir + (conW * index + (differ > 20 ? 20 : differ)) + "px,0)";
                return;
            }
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
            dir = "-"; //- left; + right;

        (endX < start.X ? dir = "-" : dir = "+");
        //滑动距离不够时还原到当前位置
        if (refDis >= Math.abs(differ)) {
            ele.style.webkitTransform = "translate(-" + conW * index + "px,0)";
            return;
        }
        moveSlides(dir);

    }
    function moveSlides(dir){
        var index = getIndex();
        ele.style.webkitTransition = "all .5s";
        //当不循环时,第一个往右和最后一个往左时return
        if (!loop) {
            //第一个往右和最后一个往左时return
            if ((index == 0 && dir == "+") || (index == size - 1 && dir == "-")) {
                ele.style.webkitTransform = "translate(" + dir + conW * index + "px,0)";
                return;
            }
        }

        if (dir === "+") {
            
            //让最后一个到最左侧需要将ele的  /*overflow: hidden;*/  去掉
            if (index == 0 && loop) {
                ele.style.webkitTransform = "translate(" + conW + "px,0)";
                end.X = Number("-" + conW * (size - 1));
                timerRe = setTimeout(function(){
                    ele.style.webkitTransition = "none";
                    ele.style.webkitTransform = "translate(-" + conW * (size - 1) + "px,0)";
                },400);
            }else{
                ele.style.webkitTransform = "translate(-" + conW * (index - 1) + "px,0)";
                end.X = Number("-" + conW * (index - 1));
            }

            setIndex(index - 1);
            moveNavs(index - 1);
        } else {
            ele.style.webkitTransform = "translate(-" + conW * (index + 1) + "px,0)";
            end.X = Number("-" + conW * (index + 1));

            if (index == size - 1) {
                timerRe = setTimeout(function(){
                    ele.style.webkitTransition = "none";
                    ele.style.webkitTransform = "translate(0,0)";
                },400);
                end.X = 0;
            }

            setIndex(index + 1);
            moveNavs(index + 1);
        }       
    }
    //trigger滚动
    function moveNavs() {
        var index = getIndex();
        for (var i = 0; i < size; i++) {
            var cl = navs[i].className;
            if (/c/.test(cl)) {
                if (i == index) {
                    return;
                }
                navs[i].className = cl.replace("c", "");
                navs[index].className += " c";
                return;
            }
        }

    }

    function setIndex(i) {
        if (i == size) {
            i = 0;
        } else if (i == -1) {
            i = size - 1
        }
        con.setAttribute("index", i);
    }
    function getIndex() {
        return Number(con.getAttribute("index"));
    }
    function moveInterval(){
        moveSlides("-");
        setTimeout(moveInterval, speed);
    }
    //初始化
    function init() {
        //init width
        nav = ele.nextElementSibling.className.indexOf("nav") > -1 ? ele.nextElementSibling : comf.getElesByClass("nav")[0];
        var navb = "";
        conW = parseInt(comf.getComputedStyles(con)["width"].replace("px", ""));
        ele.style.width = conW * size + "px";
        for (var i = 0, j = size; i < j; i++) {
            slides[i].style.width = conW + "px";
            // init nav 动态nav的子节点
            if (i == 0) {
                navb += "<b class=' c'></b>";
            } else {
                navb += "<b></b>";
            }
        }
        setIndex(0);

        //init event
        comf.addEvent(ele, "touchstart", touchStart);
        comf.addEvent(ele, "touchmove", touchMove);
        comf.addEvent(ele, "touchend", touchEnd);

        nav.innerHTML = navb;
        navs = comf.getChildren(nav);

        //init auto
        if (auto) {
            timer = setInterval(function() {
                moveSlides("-");
            }, speed);
            //timer = setTimeout(moveInterval, speed);
        }

        //init loop
        if (loop) {
            var clonef = slides[0].cloneNode(true),
                clonel = slides[size - 1].cloneNode(true);
            clonel.style.left = -conW * (size + 2) + "px";
            ele.style.width = conW * (size + 3) + "px";
            ele.appendChild(clonef);
            ele.appendChild(clonel);
        }
    }

    if (!container) return;

    var start = {
            X: 0, //开始位置x
            Y: 0 //开始位置y
        },
        end = {
            X: 0, //结束位置x
            Y: 0 //结束位置y
        };

    var options = options || {},
        // div ul li
        con = container, //div
        ele = comf.getChildren(con)[0], //ul
        slides = comf.getChildren(ele), //li
        size = slides.length, //li对象的个数

        //option获取
        speed = options.speed && 3000, //自动滚动的间隔
        auto = (options.auto && options.auto == "true") || false, //是否自动滚动  true/false
        loop = (options.loop && options.loop == "true") || false, //是否循环滚动  true/false

        //code use
        timer, //setTimeout  定时滚动
        timerRe,
        conW, //con width
        nav, //和图片一起滚动的trigger
        navs, //trigger的children
        refDis = 50, // 滑动距离，>=50后滚动
        reg = /\-?[0-9]+\.?[0-9]*/g; // 匹配transform
    return init();

};
