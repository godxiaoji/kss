/**
 * Kss Javascript Class Library
 * @Author  Travis(LinYongji)
 * @Contact http://travisup.com/
 * @Version 0.8.2
 */
(function(window, undefined) {

var kss = function(selector, context) {
        return new kss.fn.init(selector, context);
    };

var document = window.document,
    location = window.location,
    navigator = window.navigator,
    
    toString = Object.prototype.toString,
    push = Array.prototype.push,
    
    version = "0.8.2";

// return array
kss.fn = kss.prototype = {
    // update at 2012.12.12
    init: function(selector, context) {
        
        // $(undefined/null)
        if (!selector) {
            return this;
        }
        //$k(node)
        if(selector.nodeType) {
            this[0] = selector;
            this.length = 1;
            return this;
        }
        
        if(typeof selector === "string") {
            // $k("#id")
            var match = /^#([\w-]+)$/.exec(selector);
            if(match && match[1] && !context) {
                var elem = document.getElementById(match[1]);
                return kss(elem);
            }
            if(context && context.nodeType === 1) {
                this.context = context;
            } else {
                context = document;
            }
            return kss(context).find(selector);
        }
        // exec ready
        else if(typeof selector === "function" && kss.fn.ready) {
            return kss(document).ready(selector);
        }
    },
    
    // ArrayLike
    length: 0,
    splice: [].splice,
    push: push,
    context: document,
    
    // add at 2013.02.25
    size: function() {
        return this.length;
    },
    
    // update at 2012.12.11
    pushStack: function(elems) {
        var ret = kss();
        for(var i = 0; i < elems.length; i++) {
            ret[i] = elems[i];
        }
        ret.length = elems.length;
        return ret;
    },

    // update at 2012.11.21
    // allow all number
    eq: function(key) {
        // update at 2012.11.21
        // allow all number
        var ret = [], len = this.length;
        if(typeof key === "number" && len > 0) {
            if(key < 0) {
                key = Math.max(0, len + key);
            } else if(key >= len) {
                key = len - 1;
            }
            ret[0] = this[key];
        }
        return this.pushStack(ret);
    },
    
    // update at 2012.12.11
    find: function(selector) {
        if(typeof selector !== "string") return kss();
        
        var pos = selector.indexOf(" ");
        var children;
        if(pos >= 0) {
            children = selector.substr(pos+1);
            selector = selector.substring(0, pos);
        }
        if(this.length === 1) {
            var ret = kss.find(selector, this[0]);
        } else {
            var ret = [], temp;
            for(var i = 0, len = this.length; i < len; i++) {
                temp = kss.find(selector, this[i]);
                ret = kss.merge(ret, temp);
            }
        }
        var obj = this.pushStack(ret);
        if(children) {
            return obj.find(children);
        }
        return obj;
    },
    
    // update at 2013.02.14
    children: function(selector) {
        if(this.length === 1) {
            var ret = kss.children(selector, this[0]);
        } else {
            var ret = [], temp;
            for(var i = 0, len = this.length; i < len; i++) {
                temp = kss.children(selector, this[i]);
                ret = kss.merge(ret, temp);
            }
        }
        return this.pushStack(ret);
    },
    
    // update at 2013.02.19
    // 遍历元素并执行函数
    each: function(fn, args) {
        if(kss.isFunction(fn)) {
            return kss.each(this, fn, args);
        } else {
            return this;
        }
    },
    
    html: function(value) {
        // update at 2012.11.20
        if(typeof value === "undefined") {
            return this[0] && this[0].nodeType === 1 ? this[0].innerHTML : null;
        }
        // Remark: bug for ie(innerHTML only read in table elem) 
        if(typeof value === "string") {
            return kss.each(this, function() {
                if(this.nodeType === 1) this.innerHTML = value;
            }, [value]);
        } else {
            return this;
        }
    },
    
    text: function(value) {
        // update at 2012.11.20
        // GET: only get the first node text
        // Remark: bug(textContent !== innerText)
        if(typeof value === "undefined") {
            if(this[0] && this[0].nodeType === 1) {
                return this[0].textContent ? this[0].textContent : this[0].innerText;
            } else {
                return "";
            }
        }
        return kss.each(this, function() {
            if(this.nodeType === 1) {
                if(this.textContent) {
                    this.textContent = value;
                } else {
                    this.innerText = value;
                }
            }
        }, [value]);
    },
    
    val: function(value) {
        // update at 2012.11.22
        // GET: only get the first node value
        if(typeof value === "undefined") {
            if(this[0] && this[0].nodeType === 1) {
                return this[0].value ? this[0].value : "";
            } else {
                return undefined;
            }
        }
        return kss.each(this, function() {
            if(typeof this.value !== "undefined") {
                this.value = value;
            }
        }, [value]);
    },
    
    remove: function() {
        for (var i = 0; i < this.length; i++) {
            kss.remove(this[i]);
        }
        return kss();
    }
};

kss.fn.init.prototype = kss.fn;

// update at 2013.02.13
// 对象继承
kss.fn.extend = kss.extend = function(first, second) {
    // 传入第二个参数则把第二个对象的属性继承到第一个对象中并返回
    if(typeof second === "object") {
        for(var key in second) {
            if(typeof first[key] === "object") {
                first[key] = kss.extend(first[key], second[key]);
            } else {
                first[key] = second[key];
            }
        }
        return first;
    // 只传第一个参数则把对象继承到kss库中
    } else if(typeof first === "object") {
        for(var key in first) {
            this[key] = first[key];
        }
    }
};

kss.extend({
    // add at 2012.11.20
    isFunction: function(obj) {
        return toString.call(obj) === "[object Function]";
    },
    
    // add at 2012.11.20
    isArray: function(obj) {
        return toString.call(obj) === "[object Array]";
    },
        
    // add at 2012.11.22
    isEmptyObject: function(obj) {
        for(var name in obj) {
            return false;
        }
        return true;
    },
    
    // add at 2013.02.19
    // 判断是否标量
    isScalar: function(obj) {
        return typeof obj === "string" ||  typeof obj === "number" || typeof obj === "boolean";
    }
});

kss.fn.extend({
    // update at 2012.11.21
    // 获取元素父节点
    parent: function() {
        // update at 2012.11.21
        var ret = [], parent;
        for(var i = 0, len = this.length; i < len; i++) {
            parent = this[i].parentNode;
            if(parent && parent.nodeType !== 11) {
                ret.push(parent);
            }
            // filter repeat elem
            ret = kss.uniq(ret);
        }
        return this.pushStack(ret);
    },
    
    // add 2013.02.25
    // 返回元素之后第一个兄弟节点
    next: function() {
        return this[0] ? this.pushStack(kss.dir(this[0], "nextSibling", this[0], true)) : kss();
    },
    
    // add 2013.02.25
    // 返回元素之后所有兄弟节点
    nextAll: function() {
        return this[0] ? this.pushStack(kss.dir(this[0], "nextSibling", this[0])) : kss();
    },
    
    // add 2013.02.25
    // 返回元素之前第一个兄弟节点
    prev: function() {
        return this[0] ? this.pushStack(kss.dir(this[0], "previousSibling", this[0], true)) : kss();
    },
    
    // add 2013.02.25
    // 返回元素之前所有兄弟节点
    prevAll: function() {
        return this[0] ? this.pushStack(kss.dir(this[0], "previousSibling", this[0])) : kss();
    },
    
    // add 2013.02.25
    // 返回除自身以外所有兄弟节点
    siblings: function() {
        return this[0] ? this.pushStack(kss.dir(this[0].parentNode.firstChild, "nextSibling", this[0])) : kss();
    }
});

var rSelectId = /^#([\w-]+)$/,
    rSelectClass = /^([\w-]*)\.([\w-]+)$/,
    rSelectTag = /^\w+$/;

kss.extend({
    // return array
    find: function(selector, parentNode) {
        // $k("#id")
        var match = rSelectId.exec(selector);
        if(match && match[1]) {
            var elem = document.getElementById(match[1]),
                ret = [];
            if(elem) {
                ret[0] = elem;
            }
            return ret;
        }
        // $k(".class")
        match = rSelectClass.exec(selector);
        if(match && match[2]) {
            var searchClass = match[2],
                tag = match[1] || "*";
            if(document.getElementsByClassName) {
                var elems = parentNode.getElementsByClassName(searchClass),
                    ret = [];
                if(tag === "*") {
                    return elems;
                }
                for(var i = 0, len = elems.length; i < len; i++) {
                    if(elems[i].tagName === tag.toUpperCase()) {
                        ret.push(elems[i]);
                    }
                }
                return ret;
            } else {
                // for IE
                var elems = (tag === "*" && parentNode.all)? parentNode.all : parentNode.getElementsByTagName(tag),
                    ret = [];
                for(var i = 0 ; i < elems.length; i++) {
                    if(kss.hasClass(elems[i], searchClass)) {
                        ret.push(elems[i]);
                    }
                }
                return ret;
            }
        }
        // $("tag")
        if(rSelectTag.test(selector)) {
            var elems = parentNode.getElementsByTagName(selector);
            return elems;
        }
    },
    
    // update at 2013.02.25
    // 获得相应子节点
    children: function(selector, parentNode) {
        var elems = parentNode.childNodes;
        var match = rSelectClass.exec(selector);
        var ret = [];
        if(match && match[2]) {
            var searchClass = match[2],
                tag = match[1] || "*";
            for(var i = 0; i < elems.length; i++) {
                var elem = elems[i];
                if(elem.nodeType == 1) {
                    if(tag === "*" || elem.tagName === tag.toUpperCase()) {
                        if(elem.className.indexOf(searchClass) >= 0) {
                            ret.push(elem);
                        }
                    }
                }
            }
            return ret;
        }
        if(rSelectTag.test(selector)) {
            for(var i = 0; i < elems.length; i++) {
                var elem = elems[i];
                if(elem.nodeType == 1) {
                    if(elem.tagName == selector.toUpperCase()) {
                        ret.push(elem);
                    }
                }
            }
            return ret;
        }
    },
    
    // add 2013.02.25
    // 筛选节点
    dir: function(elem, dir, besides, one) {
		var matched = [],
			cur = elem;
        
		while(cur && cur.nodeType !== 9) {
			if(cur.nodeType === 1 && cur !== besides) {
				matched.push(cur);
                if(one) {
                    return matched;
                }
			}
			cur = cur[dir];
		}
		return matched;
	},
    
    // update at 2013.02.19
    // kss对象遍历
    each: function(obj, callback, args) {
        if(typeof args === "undefined") {
            for(var i = 0; i < obj.length; i++) { 
                if(callback.call(obj[i], i, obj[i]) === false) { 
                    break;
                }
            }
        } else if(kss.isArray(args)) {
            for(var i = 0; i < obj.length; i++) { 
                if(callback.apply(obj[i], args) === false) { 
                    break;
                }
            }
        }
        return obj;
    }
});

kss.extend({
    // add at 2013.02.13
    // 全局缓存
    cache: {},
    
    // add at 2013.02.15
    // 内部Key
    expando: "kss" + Math.random().toString().substr(2),
    
    // add at 2013.02.15
    // 全局索引
    guid: 1,
    
    // update at 2013.02.15
    // 缓存数据操作
    data: function(elem, key, value) {
        var id = kss.expando;
        if(typeof value === "undefined") {
            if(elem[id] && kss.cache[elem[id]]) {
                if(typeof kss.cache[elem[id]][key] !== "undefined") {
                    return kss.cache[elem[id]][key];
                }
            }
            return undefined;
        }
        if(elem.nodeType) {
            elem[id] = elem[id] || kss.guid++;
            kss.cache[elem[id]] = kss.cache[elem[id]] || {};
            kss.cache[elem[id]][key] = value;
        }
    },
    
    // add at 2012.12.12
    // 深度复制
    clone: function(obj) {
        if(!obj) {
            return obj;
        } else if(kss.isArray(obj)) {
            var newArr = [], i = obj.length;
            while(i--) {
               newArr[i] = arguments.callee.call(null, obj[i]);
            }
            return newArr;
        } else if(kss.isFunction(obj) || obj instanceof Date || obj instanceof RegExp) {
            return obj;
        } else if(typeof obj === "object") {
            var newObj = {};
            for(var i in obj) {
               newObj[i] = arguments.callee.call(null, obj[i]);
            }
            return newObj;
        } else {
            return obj;
        }
    }
});

kss.extend({
    // update at 2013.02.16
    // 队列：入队
    queue: function(elem, name, fn) {
        var fns = kss.data(elem, name);
        if(!fns || !kss.isArray(fns)) {
            fns = [];
        }
        if(kss.isFunction(fn)) {
            fns.push(fn);
        }
        kss.data(elem, name, fns);
    },
    
    // update at 2013.02.16
    // 队列：出队并执行
    dequeue: function(elem, name) {
        var fns = kss.data(elem, name), fn;
        if(fns && fns[0]) {
            fn = fns.shift();
            kss.data(elem, name, fns);
            fn.call(elem);
        }
    }
});

// update at 2012.11.26
kss.fn.extend({
    animate: function(prop, speed, easing, callback) {
        if(this.length === 0) return;
        
        var opt = kss.speed(speed, easing, callback);
        
        return kss.each(this, function() {
            if(typeof opt.callback === "function") {
                kss.queue(this, "animatequeue", opt.callback);
            }
            for(var name in prop) {
                if(kss.inArray(name, kss.fxStyle) >= 0) {
                    var fx = new kss.fx(this, opt, name);
                    var start = parseInt(kss(this).css(name));
                    var end = parseInt(prop[name]);
                    fx.custom(start, end);
                }
            }
        }, [opt]);
    },
    
    stop: function() {
        for(var i = timers.length - 1; i >= 0; i--) {
            if(timers[i].elem === this[0]) {
                timers[i].stop();
            }
        }
    }
});

var timers = [], timerId = null;

// add at 2012.11.25
kss.fx = function(elem, options, name) {
    this.elem = elem;
    this.options = options;
    this.name = name;
};

// update at 2012.11.26
kss.fx.prototype = {
    custom: function(from, to) {
        this.startTime = kss.now();
        this.start = from;
        this.end = to;
        timers.push(this);
        kss.fx.tick();
    },

    step: function() {
        var t = kss.now();  
        var nowPos;  
        if(t > this.startTime + this.options.speed) {
            nowPos = this.end;
            this.stop();
            kss.dequeue(this.elem, "animatequeue");
        } else {
            var n = t - this.startTime;
            var p = n / this.options.speed;
            var pos = kss.easing[this.options.easing](p, n, 0, 1);
            nowPos = this.start + ((this.end - this.start) * pos);
        }
        this.update(nowPos);
    },

    update: function(value) {
        if(this.name !== "opacity") {
            value += "px";
        }
        this.elem.style[this.name] = value;
    },

    stop: function() {
        for(var i = timers.length - 1; i >= 0; i--) {
            if (timers[i] === this) {
                timers.splice(i, 1);
            }
        }
    }
};

// update at 2012.11.26
kss.fx.tick = function() {
    if(timerId) return;
    timerId = setInterval(function() {
        for(var i = 0; i < timers.length; i++) {
            timers[i].step();
        }
        if(timers.length === 0) {
            kss.fx.stop();
        }
    }, 13);
};

// add at 2012.11.25
kss.fx.stop = function() {
    clearInterval(timerId);
    timerId = null;
};

// add at 2012.11.25
// from jQuery
kss.easing = {
    linear: function(p, n, firstNum, diff) {
        return firstNum + diff * p;
    },
    swing: function(p, n, firstNum, diff) {
        return ((-Math.cos(p*Math.PI)/2) + 0.5) * diff + firstNum;
    }
};

kss.extend({
    // add at 2012.11.25
    now: function() {
        return (new Date()).getTime();
    },
    
    // add at 2012.11.26
    speed: function(speed, easing, fn) {
        var opt = {
            speed: speed,
            easing: easing || "swing",
            callback: fn || null
        };
        return opt;
    },
    
    fxStyle: ["opacity", "lineHeight", "height", "width", "top", "bottom", "left", "right", "backgroundPositionX", "backgroundPositionY", "marginTop", "marginBottom", "marginLeft", "marginLeft", "paddingTop", "paddingBottom", "paddingLeft", "paddingRight"]
});

kss.extend({
    // add at 2013.02.25
    inArray: function (value, arr, fromIndex) {
        if (typeof fromIndex !== "number") {
            fromIndex = 0;
        } else if (fromIndex < 0) {
            fromIndex = Math.max(0, this.length + fromIndex);
        }
        for (var i = fromIndex; i < this.length; i++) {
            if (this[i] === value)
                return i;
            }
        return -1;
    },
    // add at 2012.11.21
    // Array clear repeat data
    uniq: function(arr) {
        var ret = [];
        if(kss.isArray(arr)) {
            for(var i = 0; i < arr.length; i++) {
                if(kss.inArray(arr[i], ret) === -1) {
                    ret.push(arr[i]);
                }
            }
            return ret;
        }
        return arr;
    },
    
    // add at 2013.02.20
    rand: function() {
        return Math.random().toString().substr(2);
    },
    
    // array++
    merge: function(first, second) {
        var i = first.length, j = 0;
        for(var l = second.length; j < l; j++ ) {
            first[i++] = second[j];
        }
        return first;
    },

    // update at 2012.12.24
    trim: function(str) {
        return (str || "").replace(/(^\s*)|(\s*$)/g, "");
    },

    // remove node
    remove: function(elem) {
        var parent = elem.parentNode;
        if(parent && parent.nodeType !== 11) {
            parent.removeChild(elem);
        }
    },
    
    // json.parse
    // add at 2012.12.14
    parseJSON: function(data) {
		if(!data || typeof data !== "string") return null;
        
		data = kss.trim(data);

		if(window.JSON && window.JSON.parse) {
			return window.JSON.parse(data);
		}

		if (/^[\],:{}\s]*$/.test(data.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@")
            .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]")
            .replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) {
			return (new Function("return " + data))();
		}
		
        kss.error("Invalid JSON: " + data);
	},
    
    // throw error
    // add at 2012.12.14
    error: function(msg) {
		throw new Error(msg);
	}
});

kss.extend({
    // ajax
    ajax: function(settings) {
        return new ajax.init(settings);
    },
    
    // add at 2013.02.20
    // 创建Script
    createScript: function(url) {
        var script = document.createElement("script");
        script.type = "text/javascript";
        if(typeof url === 'string') {
            script.src = url;
        }
        return script;
    },
    
    // update 2012.12.17
    toQueryString: function(data) {
        var str = "";
        if(typeof data === "string") {
            str = data;
        } else if(typeof data === "object") {
            for(var key in data) {
                str += "&" + key + "=" + encodeURIComponent(data[key]);
            }
        }
        str = str.substr(1);
        return str;
    },
    
    // update at 2013.02.20
    // jsonp
    getJSON: function(url, data, fn) {
        // (url, fn)
        if(fn == null) {
            fn = data;
            data = undefined;
        }
        
        var name, match, script;
        
        data = kss.toQueryString(data);
        data += (data === "" ? "" : "&") + "_=" + kss.now();
        url += (url.indexOf("?") === -1 ? "?" : "&") + data;
        
        match = /callback=(\w+)/.exec(url);
        if(match && match[1]) {
            name = match[1];
        } else {
            name = "kss" + kss.rand() + "_" + kss.now();
            url = url.replace("callback=?", "callback=" + name).replace("callback=%3F", "callback=" + name);
        }
        
        script = kss.createScript(url);
        
        window[name] = function(json) {
            kss(script).remove();
            if(kss.isFunction(fn)) {
                fn.call(window, json);
            }
            delete window[name];
        };
        
        kss("head")[0].appendChild(script);
    },
    
    // add at 2013.02.22
    // 远程载入js
    getScript: function(url, data, fn) {
        if(fn == null) {
            fn = data;
            data = undefined;
        }
    
        data = kss.toQueryString(data);
        data += (data === "" ? "" : "&") + "_=" + kss.now();
        url += (url.indexOf("?") === -1 ? "?" : "&") + data;
        
        script = kss.createScript(url);
        
        if(document.all) {
            script.onreadystatechange = function() {
                if(this.readyState === "complete" || this.readyState == "loaded") {
                    if(kss.isFunction(fn)) {
                        fn.call(window);
                    }
                    script.onreadystatechange = null;
                    kss(script).remove();
                }
            };
        } else {
            script.onload = function() {
                kss(script).remove();
                if(kss.isFunction(fn)) {
                    fn.call(window);
                }
                script.onload = null;
                kss(script).remove();
            };
        }
        
        kss("head")[0].appendChild(script);
    }
});

// ajax object
var ajax = {
    xhr: function() {
        if(window.XMLHttpRequest && (window.location.protocol !== "file:" || !window.ActiveXObject)) {
            return new window.XMLHttpRequest();
        } else {
            try {
                return new window.ActiveXObject("Microsoft.XMLHTTP");
            } catch(e) {}
        }
    },
    
    settings: {
        url: null,
        type: "GET",
        data: null,
        async: true,
        cache: true,
        timeout: null,
        contentType: "application/x-www-form-urlencoded",
        dataType: "",
        beforeSend: function(xhr) {},
        success: function(data, status) {},
        error: function(xhr, status) {},
        complete: function(xhr, status) {}
    },
    
    // update 2012.12.14
    httpData: function(xhr, type) {
        var ct = xhr.getResponseHeader("content-type") || "";
        if(!type && ct.indexOf("xml") >= 0 || type.toLowerCase() == "xml") return xhr.responseXML;
        if(type === "json") return kss.parseJSON(xhr.responseText);
        return xhr.responseText;
    },
    
    // update 2012.12.14
    init: function(s) {
        if(typeof s !== "object") {
            return false;
        }
        
        for(var i in ajax.settings) {
            if(typeof s[i] === "undefined") {
                s[i] = ajax.settings[i];
            }
        }
        var xhr = ajax.xhr();
        s.beforeSend(xhr);
        // callback
        xhr.onreadystatechange = function() {
            if(xhr.readyState === 4) {
                if(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
                    var data = ajax.httpData(xhr, s.dataType);
                    s.success(data, xhr.status);
                } else {
                    s.error(xhr, xhr.status);
                }
                s.complete(xhr, xhr.status);
            }
        };
        //send
        if(!s.url || typeof s.url !== "string") {
            return;
        }
        if(s.type === "GET") {
            var data = kss.toQueryString(s.data);
            if(s.cache === false) {
                data += (data === "" ? "" : "&") + "_=" + kss.now();
            }
            var url = s.url + (s.url.indexOf("?") === -1 ? "?" : "&") + data;
            xhr.open(s.type, url, s.async);
            xhr.send();
        } else if(s.type === "POST") {
            var data = kss.toQueryString(s.data);
            xhr.open(s.type, s.url, s.async);
            xhr.setRequestHeader("Content-type", s.contentType);
            xhr.send(data); 
        } else {
            return;
        }
    }
};

// add at 2013.02.16
// 返回false函数
function returnFalse() {
	return false;
}

// add at 2013.02.22
// 事件函数
kss.each(("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu").split(" "), function(i, name) {
    kss.fn[name] = function(data, fn) {
        return  arguments.length > 0 ?
			this.on(name, null, data, fn) : 
            this.trigger(name);
    };
});

kss.fn.extend({
    // add 2013.02.15
    // 事件绑定(bind/live/delegate)
    on: function(type, selector, data, fn) {
        if(typeof type !== "string" || type == "") {
            return this;
        }
        // (type, fn)
        if(data == null && fn == null) {
            fn = selector;
			data = selector = undefined;
        // (type, fn)
        } else if(fn == null) {
            if (typeof selector === "string") {
				// (type, selector, fn)
				fn = data;
				data = undefined;
			} else {
				// (type, data, fn)
				fn = data;
				data = selector;
				selector = undefined;
			}
        }
        if(!kss.isFunction(fn)) {
            fn = returnFalse;
        }
        return kss.each(this, function() {
            kss.event.add(this, type, selector, data, fn);
        }, [type, selector, data, fn]);
    },
    
    // add 2013.02.15
    // 事件解绑(unbind/die/undelegate)
    off: function(type, selector, fn) {
        if(typeof type !== "string" || type == "") {
            return this;
        }
        
        // (type[, fn])
        if(!selector || kss.isFunction(selector)) {
            fn = selector;
            selector = undefined;
        }
        
        if(!fn) {
            fn = undefined;
        }
        return kss.each(this, function() {
            kss.event.remove(this, type, selector, fn);
        }, [type, selector, fn]);
    },
    
    trigger: function(type) {
        return kss.each(this, function() {
            kss.event.trigger(this, type);
        });
    },
    
    ready: function(fn) {
        // add at 2012.11.18
        kss.bindReady();
        if (kss.isReady) {
           fn.call(document, kss);
        } else if(readyList) {
           readyList.push(fn);  
        }        
        return this;
    }
});

kss.event = {
    // update at 2013.02.20
    // 事件绑定
    add: function(elem, type, selector, data, fn) {
        var handleObj = {}, handler, id = kss.expando;
        // 事件委托
        if(selector) {
            handler = function(e) {
                var elems = $(elem).find(selector),
                    evt = window.event ? window.event : e,
                    target = evt.target || evt.srcElement;
                // 统一事件阻止
                evt.stopPropagation = evt.stopPropagation || function() {
                    window.event.cancelBubble = true;
                };
                evt.data = data;
                for(var i = 0; i < elems.length; i++) {
                    if(elems[i] == target) {
                        return fn.call(target, evt);
                    }
                }
            }
        // 直接绑定
        } else {
            handler = function(e) {
                var evt = window.event ? window.event : e;
                evt.stopPropagation = evt.stopPropagation || function() {
                    window.event.cancelBubble = true;
                };
                evt.data = data;
                return fn.call(elem, evt);
            };
        }
        
        // 事件缓存
        var events = kss.data(elem, "events");
        if(!events) {
            events = {};
        }
        
        handleObj.handler = handler;
        handleObj.selector = selector;
        handleObj.data = data;
        handleObj.guid = fn[id] = fn[id] || kss.guid++;
        
        events[type] = events[type] || [];
        events[type].push(handleObj);
        
        kss.data(elem, "events", events);
        
        if(window.addEventListener) {
            elem.addEventListener(type, handler, false);
        } else if (document.attachEvent) {
            elem.attachEvent("on" + type, handler);
        } else {
            elem["on" + type] = handler;
        }
    },
    
    // update at 2013.02.15
    // 事件解绑
    remove: function(elem, type, selector, fn) {
        var handleObj, handler,
            id = kss.expando,
            events = kss.data(elem, "events"), typeObj = [];
        if(!elem[id] || !events || !events[type]) {
            return;
        }
        
        if(kss.isFunction(fn) && !fn[id]) {
            return;
        }
        
        for(var i = 0; i < events[type].length; i++) {
            handleObj = events[type][i];
            if(typeof fn === "undefined" || 
                (typeof selector !== "undefined" && handleObj.selector === selector && fn[id] === handleObj.guid) || 
                (typeof selector === "undefined" && fn[id] === handleObj.guid)) {
                
                handler = handleObj.handler;
                
                if(elem.removeEventListener) {
                    elem.removeEventListener(type, handler, false);
                } else if (document.detachEvent) {
                    elem.detachEvent("on" + type, handler);
                } else {
                    elem["on" + type] = null;
                }
            } else {
                typeObj.push(handleObj);
            }
        }
        events[type] = typeObj;
        kss.data(elem, "events", events);
    },
    
    trigger: function(elem, event) {
        elem[event].call(elem);
        /* if(document.createEventObject) {
            var evt = document.createEventObject();
            return elem.fireEvent("on"+event, evt);
        } else {
            var evt = document.createEvent("HTMLEvents");
            evt.initEvent(event, true, true); 
            return !elem.dispatchEvent(evt);
        } */
    }
};

// document ready
var readyList = [], readyBound = false, DOMContentLoaded;

if (document.addEventListener) {
    DOMContentLoaded = function() {
        document.removeEventListener("DOMContentLoaded", DOMContentLoaded, false);
        kss.ready();
    };
} else if (document.attachEvent) {
    DOMContentLoaded = function() {
        if(document.readyState === "complete") {
            document.detachEvent("onreadystatechange", DOMContentLoaded);
            kss.ready();
        }
    };
}

var doScrollCheck = function() {
    if(kss.isReady) {
        return;
    }
    try {
        document.documentElement.doScroll("left");
    } catch(e) {
        setTimeout(doScrollCheck, 1);
        return;
    }
    kss.ready();
};

kss.extend({

    isReady: false,

    bindReady: function() {
        if(readyBound) return;
        readyBound = true;
        
        if(document.readyState === "complete") return kss.ready();     
        
        if(document.addEventListener) {
            document.addEventListener("DOMContentLoaded", DOMContentLoaded, false);
            window.addEventListener("load", kss.ready, false);
        } else if (document.attachEvent) {
            document.attachEvent("onreadystatechange", DOMContentLoaded);
            window.attachEvent("onload", kss.ready);
            
            var toplevel = false;
            try {
                toplevel = window.frameElement == null;
            } catch(e) {}
            if(document.documentElement.doScroll && toplevel) {
                doScrollCheck();
            }
        }
    },

    ready: function() {
        if(!kss.isReady) {
            if(!document.body) {
               return setTimeout(kss.ready, 13);
            }
            kss.isReady = true;
            if(readyList) {
                for(var i = 0; i < readyList.length; i++) {
                    var fn = readyList[i];
                    fn.call(document, kss);
                }
                readyList = [];
            }
        }
    }
});


// 属性操作原型链
kss.fn.extend({
    // update at 2013.02.19
    // 读取或设置元素属性
    attr: function(name, value) {
        if(typeof name !== "string") {
            return this;
        }
        if(typeof value === "undefined") {
            if(this[0] && this[0].nodeType === 1) {
                return this[0].getAttribute(name);
            } else {
                return undefined;
            }
        } else if(kss.isScalar(value)) {
            return kss.each(this, function() {
                kss.setAttr(this, name, value);
            });
        }
        return this;
    },
    
    // add at 2013.02.19
    // 删除元素指定属性
    removeAttr: function(name) {
        if(typeof name !== "string") {
            return this;
        }
        return kss.each(this, function() {
            kss.removeAttr(this, name);
        });
    },
    
    // add at 2013.02.19
    // 特殊属性处理
    prop: function(name, value) {
        if(typeof value === "undefined") {
            var prop =  this.attr(name);
            if(kss.inArray(name, kss.sepProp) >= 0) {
                return typeof prop === "string" && (prop === name || prop === "");
            }
            return prop;
        }
        if(kss.inArray(name, kss.sepProp) >= 0 && typeof value === "boolean") {
            if(value) {
                value = name;
            } else {
                return this.removeAttr(name);
            }
        }
        return this.attr(name, value);
    }
});

// 属性操作
kss.extend({
    // update at 2013.02.19
    // 设置元素属性（只支持元素）
    setAttr: function(elem, name, value) {
        if(elem.nodeType === 1) {
            elem.setAttribute(name, value);
        }
    },
    
    // add at 2013.02.19
    // 删除元素指定属性（只支持元素）
    removeAttr: function(elem, name) {
        if(elem.nodeType === 1) {
            elem.removeAttribute(name);
        }
    },
    
    // add at 2013.02.19
    // 需要特殊处理的属性
    sepProp: ['disabled', 'checked', 'selected', 'multiple', 'readonly', 'async', 'autofocus']
});

// 样式操作原型链
kss.fn.extend({
    // add at 2013.02.19
    // 判断元素是否有对应Class
    hasClass: function(className) {
        if(typeof className !== "string") {
            return false;
        }
        className = " " + className + " ";
		for(var i = 0, len = this.length; i < len; i++ ) {
			if(this[i].nodeType === 1 && (" " + this[i].className + " ").indexOf(className) >= 0) {
				return true;
			}
		}
		return false;
    },
    
    // add at 2013.02.19
    // 添加Class
    addClass: function(className) {
        if(typeof className !== "string") {
            return;
        }
        return kss.each(this, function() {
            kss.addClass(this, className);
        });
    },
    
    // add at 2013.02.19
    // 删除Class
    removeClass: function(className) {
        if(typeof className !== "string") {
            return;
        }
        return kss.each(this, function() {
            kss.removeClass(this, className);
        });
    },

    // update at 2012.11.22
    // GET: only get the first node current css
    css: function(name, value) {
        if(typeof value === "undefined") {
            if(this[0] && this[0].nodeType === 1) {
                return kss.curCss(this[0], name);
            } else {
                return undefined;
            }
        }
        return kss.each(this, function() {
            kss.setCss(this, name, value);
        });
    },
    
    // add at 2012.11.26
    show: function() {
        return kss.each(this, function() {
            kss.show(this);
        });
    },
    
    // add at 2012.11.26
    hide: function() {
        return kss.each(this, function() {
            kss.hide(this);
        });
    }
});

// 样式操作
kss.extend({
    // add at 2013.02.19
    // 判断元素是否有对应Class
    hasClass: function(elem, className) {
        return elem.nodeType === 1 && (" " + elem.className + " ").indexOf(" " + className + " ") >= 0;
    },
    
    // add at 2013.02.19
    // 添加Class
    addClass: function(elem, className) {
        if(elem.nodeType === 1 && !kss.hasClass(elem, className)) {
            elem.className = kss.trim(elem.className + " " + className + " ");
        }
    },
    
    // add at 2013.02.19
    // 删除Class
    removeClass: function(elem, className) {
        if(elem.nodeType === 1) {
            elem.className = kss.trim((" " + elem.className + " ").replace(" " + className + " ", " "));
        }
    },
    
    // add at 2012.12.12
    // 显示元素
    show: function(elem) {
        var old = kss.data(elem, "olddisplay");
        elem.style.display = old || "";
        var display = kss.curCss(elem, "display");
        if(display == "none") {
            // 非内联样式中如果设置了display:none，无论是原来是哪种盒子模型，都设置为block（暂定）
            elem.style.display = "block";
        }
    },
    
    // add at 2012.12.12
    // 隐藏元素
    hide: function(elem) {
        var display = kss.curCss(elem, "display");
        if(display != "none") {
            kss.data(elem, "olddisplay", display);
        }
        elem.style.display = "none";
    },

    // add at 2012.11.22
    // set CSS
    setCss: function(elem, name, value) {
        if(elem.nodeType !== 1 || typeof name !== "string" || typeof value !== "string") {
            return;
        }
        if(elem.style.hasOwnProperty(name)) {
            elem.style[name] = value;
        }
    },

    // update at 2012.11.26
    // current CSS
    curCss: function(elem, name) {
        if(elem.nodeType !== 1) {
            return undefined;
        }
        
        var ret = null;
        
        if(window.getComputedStyle) {
            var computed = window.getComputedStyle(elem, null);
            ret = computed.getPropertyValue( name ) || computed[ name ];
            return ret;
        }
        // for ie
        else if(document.documentElement.currentStyle) {
            name = kss.camelCase(name);
            ret = elem.currentStyle && elem.currentStyle[name];
            
            if(ret == null && elem.style && elem.style[name]) {
                ret = style[name];
            }
            // opacity
            
            // get width and height on px
            if(/^(height|width)$/.test(name) && !/(px)$/.test(ret)) {
                ret = (name == "width") ? elem.offsetWidth : elem.offsetHeight;
                if(ret <= 0 || ret == null) {
                    var pSide = (name == "width") ? ["left", "right"] : ["top", "bottom"];
                    var client = parseFloat(elem[kss.camelCase("client-" + name)]),
                        paddingA = parseFloat(kss.curCss(elem, "padding-" + pSide[0])),
                        paddingB = parseFloat(kss.curCss(elem, "padding-" + pSide[1]));
                    ret = (client - paddingA - paddingB);
                }
                ret += "px";
            }
            
            if(/(em|pt|mm|cm|pc|in|ex|rem|vw|vh|vm|ch|gr)$/.test(ret)) {
                ret = kss.convertPixel(elem, ret);
            }
            return ret;
        }
        return undefined;
    },
    
    // add at 2012.11.26
    camelCase: function(attr) {
        return attr.replace(/\-(\w)/g, function(all, letter) {
            return letter.toUpperCase();
        });
    },
    
    // add at 2012.11.27
    // From the awesome hack by Dean Edwards
    // convert em,pc,pt,cm,in,ex to px(no include %)
    convertPixel: function(elem, value) {
        var left, rsLeft,
            ret = value,
			style = elem.style;

        // cache left/rsLeft
		left = elem.style.left;
		rsLeft = elem.runtimeStyle && elem.runtimeStyle.left;

        if(rsLeft) elem.runtimeStyle.left = elem.currentStyle.left;
        
        style.left = value || 0;
        ret = style.pixelLeft + "px";

		style.left = left;
        if(rsLeft) elem.runtimeStyle.left = rsLeft;

		return ret === "" ? "auto" : ret;
    }
});

// extra extend
kss.extend({
    // update at 2012.12.24
    // get param from url
    get: function(name) {
        if(!location.search) return undefined;
        
        var search = location.search.substr(1);
        var pathInfo = search.split("&");
        
        var params = {}, key, value, pos;
        for(var i = 0; i < pathInfo.length; i++) {
            pos = pathInfo[i].indexOf("=");
            if(pos > 0) {
                key = pathInfo[i].substring(0, pos);
                value = pathInfo[i].substring(pos+1);
                params[key] = decodeURIComponent(value);
            }
        }
        if(typeof name === "undefined") {
            if(kss.isEmptyObject(params)) {
                return undefined;
            }
            return params;
        }
        if(params.hasOwnProperty(name)) {
            return params[name];
        } else {
            return undefined;
        }
    },

    // cookie
    cookie: function(name, value, options) {
        if(typeof name === "undefined") return null;
        // get
        if(typeof value === "undefined") {
            var cookieValue = null;
            if (document.cookie && document.cookie != "") {
                var cookies = document.cookie.split(";");
                for (var i = 0; i < cookies.length; i++) {
                    var cookie = kss.trim(cookies[i]);
                    if(cookie.indexOf(name+"=") === 0) {
                        cookieValue = cookie.substr(name.length+1);
                        break;
                    }
                }
            }
            return cookieValue;
        }
        // set
        options = options || {};
        // delete
        if (value === null) {
            value = "";
            options.expires = -1;
        }
        var expires = "";
        if (options.expires && (typeof options.expires == "number" || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == "number") {
                date = new Date();
                date.setTime(date.getTime() + options.expires * 1000);
            } else {
                date = options.expires;
            }
            expires = "; expires=" + date.toUTCString();
        }
        var path = options.path ? "; path=" + options.path : "";
        var domain = options.domain ? "; domain=" + options.domain : "";
        var secure = options.secure ? "; secure" : "";
        var ret = [name, "=", encodeURIComponent(value), expires, path, domain, secure].join("");
        document.cookie = ret;
        return ret;
    }
});

// add at 2012.11.23
kss.uaMatch = function(ua) {
    ua = ua.toLowerCase();

    var browser = {
        ie: false,
        firefox: false,
        safari: false,
        opera: false,
        chrome: false,
        
        gecko: false,
        webkit: false,
        
        version: null
    };
    
    if(window.opera) {
        browser.version = window.opera.version();
        browser.opera = true;
    } else {
        var match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
            /(webkit)[ \/]([\w.]+)/.exec(ua) ||
            /ms(ie)\s([\w.]+)/.exec(ua) ||
            /(firefox)[ \/]([\w.]+)/.exec(ua) ||
            [];
        
        if(match[1]) browser[match[1]] = true;
        browser.version = match[2] || "0";
        
        if(browser.webkit) {
            browser.safari = true;
            var safariMatch = /version\/([\w.]+)/.exec(ua);
            browser.version = safariMatch[1] || "0";
        }
        if(browser.chrome) browser.webkit = true;
        if(browser.firefox) browser.gecko = true;
    }
    
    return browser;
};
// update at 2012.11.23
kss.browser = kss.uaMatch(navigator.userAgent);

window.kss = window.$ = kss;

})(window);