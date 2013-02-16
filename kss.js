/**
 * Kss Javascript Class Library
 * @Author  Travis(LinYongji)
 * @Contact http://travisup.com/
 * @Version 0.7.0
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
    
    version = "0.7.0";

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
    
    push: function(elems) {
        // update at 2012.12.11
        var ret = kss();
        for(var i = 0; i < elems.length; i++) {
            ret[i] = elems[i];
        }
        ret.length = elems.length;
        return ret;
    },
    
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
        return this.push(ret);
    },
    
    find: function(selector) {
        // update at 2012.12.11
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
        var obj = this.push(ret);
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
        return this.push(ret);
    },
    
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
        return this.push(ret);
    },
    
    attr: function(name, value) {
        // update at 2012.11.21
        // GET: only get the first node attribute
        if(typeof value === "undefined") {
            if(this[0] && this[0].nodeType === 1) {
                return this[0].getAttribute(name);
            } else {
                return undefined;
            }
        }
        return kss.each(this, function() {
            kss.attr(this, name, value);
        }, [name, value]);
    },
    
    each: function(fn, args) {
        // update at 2012.11.20
        if(kss.isFunction(fn) && kss.isArray(args)) {
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
    
    css: function(name, value) {
        // update at 2012.11.22
        // GET: only get the first node current css
        if(typeof value === "undefined") {
            if(this[0] && this[0].nodeType === 1) {
                return kss.curCss(this[0], name);
            } else {
                return undefined;
            }
        }
        return kss.each(this, function() {
            kss.setCss(this, name, value);
        }, [name, value]);
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
    
    ready: function(fn) {
        // add at 2012.11.18
        kss.bindReady();
        if (kss.isReady) {
           fn.call(document, kss);
        } else if(readyList) {
           readyList.push(fn);  
        }        
        return this;
    },
    
    show: function() {
        return kss.each(this, function() {
            kss.show(this);
        });
    },
    
    hide: function() {
        return kss.each(this, function() {
            kss.hide(this);
        });
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
    // add at 2013.02.13
    // 全局缓存
    cache: {},
    
    // add at 2013.02.15
    // 内部Key
    expando: "kss_" + Math.random().toString().substr(2),
    
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
                if(kss.fxStyle.indexOf(name) >= 0) {
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

// add at 2012.11.21
// for not array indexOf
if(!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (obj, fromIndex) {
        if (typeof fromIndex !== "number") {
            fromIndex = 0;
        } else if (fromIndex < 0) {
            fromIndex = Math.max(0, this.length + fromIndex);
        }
        for (var i = fromIndex; i < this.length; i++) {
            if (this[i] === obj)
                return i;
            }
        return -1;
    };
}

kss.extend({
    // add at 2012.11.20
    isFunction: function(obj) {
        return toString.call(obj) === "[object Function]";
    },
    
    // add at 2012.11.22
    isEmptyObject: function(obj) {
        for(var name in obj) {
            return false;
        }
        return true;
    },
    
    // add at 2012.11.20
    isArray: function(obj) {
        return toString.call(obj) === "[object Array]";
    }
});

kss.extend({
    // return array
    find: function(selector, parentNode) {
        // $k("#id")
        var match = /^#([\w-]+)$/.exec(selector);
        if(match && match[1]) {
            var elem = document.getElementById(match[1]),
                ret = [];
            if(elem) {
                ret[0] = elem;
            }
            return ret;
        }
        // $k(".class")
        match = /^([\w-]*)\.([\w-]+)$/.exec(selector);
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
                    match = new RegExp("(^|\\s)" + searchClass + "(\\s|$)"),
                    ret = [];
                for(var i = 0 ; i < elems.length; i++) {
                    if(match.test(elems[i].className)) {
                        ret.push(elems[i]);
                    }
                }
                return ret;
            }
        }
        // $("tag")
        if(/^\w+$/.test(selector)) {
            var elems = parentNode.getElementsByTagName(selector);
            return elems;
        }
    },
    
    // update at 2013.02.14
    children: function(selector, parentNode) {
        var elems = parentNode.childNodes;
        var match = /^([\w-]*)\.([\w-]+)$/.exec(selector);
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
        if(/^\w+$/.test(selector)) {
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
    
    each: function(obj, callback, args) {
        if(typeof args === "undefined") {
            for(var i = 0; i < obj.length; i++) { 
                if(callback.call(obj[i], i, obj[i]) === false) { 
                    break;
                }
            }
        } else {
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
    // add at 2012.11.21
    // Array clear repeat data
    uniq: function(arr) {
        var ret = [];
        if(kss.isArray(arr)) {
            for(var i = 0; i < arr.length; i++) {
                if(ret.indexOf(arr[i]) === -1) {
                    ret.push(arr[i]);
                }
            }
            return ret;
        }
        return arr;
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
    
    // set attribute
    attr: function(elem, name, value) {
        if (!elem || elem.nodeType == 3 || elem.nodeType == 8)
            return undefined;
        
        elem.setAttribute(name, value);
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
    // add at 2012.12.19
    // jsonp
    getJSON: function(url, data, fn) {
        if(typeof url !== "string") {
            return;
        }
        
        var name,
            data = ajax.queryString(data);
        
        data += (data === "" ? "" : "&") + "kss_time=" + kss.now();
        url = url + (url.indexOf("?") === -1 ? "?" : "&") + data;
        
        var match = /callback=(\w+)/.exec(url);
        if(match && match[1]) {
            name = match[1];
        } else {
            name = "kss_jsonp_" + kss.now() + '_' + Math.random().toString().substr(2);
            url = url.replace("callback=?", "callback=" + name);
            url = url.replace("callback=%3F", "callback=" + name);
        }
        
        var jsonp = document.createElement("script");
        jsonp.type = "text/javascript";
        jsonp.src = url;
        jsonp.id = name;
        
        window[name] = function(json) {
            kss("#"+name).remove();
            window[name] = undefined;
            if(kss.isFunction(fn)) {
                fn(json);
            }
        };
        
        var head = kss("head");
        if(head[0]) {
            head[0].appendChild(jsonp);
        }
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
        dataType: null,
        beforeSend: function(xhr) {},
        success: function(data, status) {},
        error: function(xhr, status) {},
        complete: function(xhr, status) {}
    },
    
    // update 2012.12.17
    queryString: function(data) {
        var ret = "";
        if(typeof data === "string") {
            ret = data;
        }
        else if(typeof data === "object") {
            for(var key in data) {
                ret += "&" + key + "=" + encodeURIComponent(data[key]);
            }
        }
        ret = ret.substr(1);
        return ret;
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
            var data = ajax.queryString(s.data);
            if(s.cache === false) {
                data += (data === "" ? "" : "&") + "kss_time=" + kss.now();
            }
            var url = s.url + (s.url.indexOf("?") === -1 ? "?" : "&") + data;
            xhr.open(s.type, url, s.async);
            xhr.send();
        } else if(s.type === "POST") {
            var data = ajax.queryString(s);
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

kss.event = {
    // update at 2013.02.15
    // 事件绑定
    add: function(elem, type, selector, data, fn) {
        /* if(!elem.nodeType || typeof type !== "string" || elem.nodeType === 3 || elem.nodeType === 8) {
            return;
        } */
        var handleObj = {}, handler, id = kss.expando;
        // 事件委托
        if(selector) {
            handler = function(e) {
                var elems = $(elem).find(selector),
                    evt = window.event ? window.event : e,
                    target = evt.target || evt.srcElement;
                evt.data = data;
                for(var i = 0; i < elems.length; i++) {
                    if(elems[i] == target) {
                        fn.call(target, evt);
                        break;
                    }
                }
            }
        // 直接绑定
        } else {
            handler = function(e) {
                var evt = window.event ? window.event : e;
                evt.data = data;
                fn.call(elem, evt);
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

// 样式操作
kss.extend({
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