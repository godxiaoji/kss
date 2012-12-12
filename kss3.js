/**
 * @Name    kss query
 * @Author  linyongji
 * @Version 0.5.0
 */
(function(window, undefined) {

var kss = function(selector, context) {
        return new kss.fn.init(selector, context);
    };

var document = window.document,
    location = window.location,
    navigator = window.navigator,
    
    toString = Object.prototype.toString,
    push = Array.prototype.push;

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
        var child;
        if(pos >= 0) {
            child = selector.substr(pos+1);
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
        if(child) {
            return obj.find(child);
        }
        return obj;
    },
    
    child: function(selector) {
        if(this.length === 1) {
            var ret = kss.child(selector, this[0]);
        } else {
            var ret = [], temp;
            for(var i = 0, len = this.length; i < len; i++) {
                temp = kss.child(selector, this[i]);
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
    
    bind: function(type, handler) {
        // update at 2012.11.20
        return kss.each(this, function() {
            kss.event.add(this, type, handler);
        }, [type, handler]);
    },
    
    unbind: function(type, handler) {
        return kss.each(this, function() {
            kss.event.remove(this, type, handler);
        }, [type, handler]);
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

// add at 2012.11.22
// kss object prototype
kss.fn.extend = kss.extend = function(obj) {
    if(typeof obj === 'object') {
        for(var key in obj) {
            this[key] = obj[key];
        }
    }
};

// data Cache
var dataCache = {};
window.dataCache =dataCache;
kss.data = function(elem, key, value) {
    if(value === undefined) {
        if(dataCache.hasOwnProperty(elem)) {
            if(dataCache[elem].hasOwnProperty(key)) {
                return dataCache[elem][key];
            }
        }
        return null;
    }
    if(!dataCache.hasOwnProperty(elem)) dataCache[elem] = {};
    dataCache[elem][key] = value;
    return dataCache[elem];
};

// add at 2012.12.12
// deep copy
kss.clone = function(obj) {
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
    } else if(typeof obj === 'object') {
        var newObj = {};
        for(var i in obj) {
           newObj[i] = arguments.callee.call(null, obj[i]);
        }
        return newObj;
    } else {
        return obj;
    }
};

kss.extend({
    // add at 2012.12.12
    queue: function(elem, name, func) {
        if(!dataCache.hasOwnProperty(elem) || !kss.isArray(dataCache[elem][name])) {
            kss.data(elem, name, []);
        }
        if(kss.isFunction(func)) {
            dataCache[elem][name].push(func);
        }
    },
    
    // add at 2012.12.12
    dequeue: function(elem, name, func) {
        kss.queue(elem, name, func);
        if(dataCache[elem][name][0]) {
            func = dataCache[elem][name].shift();
            func.call(elem);
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
                kss.queue(this, 'animatequeue', opt.callback);
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
            kss.dequeue(this.elem, 'animatequeue');
        } else {
            var n = t - this.startTime;
            var p = n / this.options.speed;
            var pos = kss.easing[this.options.easing](p, n, 0, 1);
            nowPos = this.start + ((this.end - this.start) * pos);
        }
        this.update(nowPos);
    },

    update: function(value) {
        if(this.name !== 'opacity') {
            value += 'px';
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
    
    fxStyle: ['opacity', 'lineHeight', 'height', 'width', 'top', 'bottom', 'left', 'right', 'backgroundPositionX', 'backgroundPositionY', 'marginTop', 'marginBottom', 'marginLeft', 'marginLeft', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight']
});

// add at 2012.11.21
// for not array indexOf
if(!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (obj, fromIndex) {
        if (typeof fromIndex !== 'number') {
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
    
    // return array
    child: function(selector, parentNode) {
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

    // update at 2012.11.20
    trim: function(str) {
        return (str || "").replace(/^\s+/g, "").replace(/\s+$/g, "");
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
        if(parent && parent.nodeType !== 11){
            parent.removeChild(elem);
        }
    }
});

// ajax
kss.ajax = function(settings) {
    return new ajax.init(settings);
};
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
        type: 'GET',
        data: null,
        async: true,
        timeout: null,
        contentType: 'application/x-www-form-urlencoded',
        dataType: null,
        beforeSend: function() {},
        success: function(data, status) {},
        error: function(xhr, status) {},
        complete: function(xhr, status) {}
    },
    
    queryString: function(data) {
        if(!data) return '';
        if(typeof data === 'string') return data;
        var ret = '';
        if(typeof data === 'object') {
            for(var key in data) {
                ret += '&' + key + '=' + encodeURIComponent(data[key]);
            }
            ret = ret.substr(1);
        }
        return ret;
    },
    
    httpData: function(xhr, type) {
        var ct = xhr.getResponseHeader("content-type") || "";
        if(!type && ct.indexOf("xml") >= 0 || type.toLowerCase() == "xml") return xhr.responseXML;
        return xhr.responseText;
    },
    
    init: function(settings) {
        if(typeof settings !== 'object') {
            return false;
        }
        
        for(var i in ajax.settings) {
            if(typeof settings[i] === 'undefined') {
                settings[i] = ajax.settings[i];
            }
        }
        var s = settings;
        
        var xhr = ajax.xhr();
        
        s.beforeSend();
        //send
        if(!s.url) return false;
        if(s.type == 'GET') {
            var url = s.url.indexOf('?') >= 0 ? s.url : s.url + '?',
                data = ajax.queryString(s.data);
            url = url + (url.substr(-1) == '?' ? '' : '&') + data;
            xhr.open(s.type, url, s.async);
            xhr.send();
        } else if(s.type == 'POST') {
            var data = ajax.queryString(s.data);
            xhr.open(s.type, s.url, s.async);
            xhr.setRequestHeader('Content-type', s.contentType);
            xhr.send(data); 
        } else {
            return false;
        }
        // callback
        xhr.onreadystatechange = function() {
            if(xhr.readyState == 4) {
                if(xhr.status == 200) {
                    var data = ajax.httpData(xhr, s.dataType);
                    s.success(data, xhr.status);
                } else {
                    s.error(xhr, xhr.status);
                }
                s.complete(xhr, xhr.status);
            }
        }
        
    }
};

kss.event = {
    // cache for attachEvent 
    handle:{},
    
    add: function(elem, type, handler) {
        // update at 2012.11.23
        if(!elem.nodeType || typeof type !== 'string' || elem.nodeType === 3 || elem.nodeType === 8) {
            return;
        }
        var eventHandler = handler;
        if(window.addEventListener) {
            elem.addEventListener(type, eventHandler, false);
        } else if (document.attachEvent) {
            // for lte ie8
            // hack for attachEvent("this" point to [object window])
            eventHandler = function() {
                handler.call(elem);
            };
            kss.event.handle[handler] = eventHandler;
            elem.attachEvent("on" + type, eventHandler);
        } else {
            elem["on" + type] = eventHandler;
        }
    },
    
    remove: function(elem, type, handler) {
        // update at 2012.11.23
        if(!elem.nodeType || typeof type !== 'string' || elem.nodeType === 3 || elem.nodeType === 8) {
            return false;
        }
        var eventHandler = handler;
        if(elem.removeEventListener) {
            elem.removeEventListener(type, eventHandler, false);
        } else if (document.detachEvent) {
            eventHandler = kss.event.handle[handler];
            elem.detachEvent('on' + type, eventHandler);
        } else {
            elem["on" + type] = null;
        }
        elem = null;
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

// style
kss.extend({
    // show hide
    show: function(elem) {
        var old = kss.data(elem, "olddisplay");
        elem.style.display = old || "";
        var display = kss.curCss(elem, 'display');
        if(display == 'none') {
            elem.style.display = 'block';
        }
    },

    hide: function(elem) {
        var display = kss.curCss(elem, 'display');
        if(display != 'none') {
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
    // update at 2012.12.11
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
                params[key] = value;
            }
        }
        if(typeof name === 'undefined') {
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
        if(typeof name === 'undefined') return null;
        // get
        if(typeof value === 'undefined') {
            var cookieValue = null;
            if (document.cookie && document.cookie != '') {
                var cookies = document.cookie.split(';');
                for (var i = 0; i < cookies.length; i++) {
                    var cookie = kss.trim(cookies[i]);
                    if(cookie.indexOf(name+'=') === 0) {
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
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + options.expires * 1000);
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString();
        }
        var path = options.path ? '; path=' + options.path : '';
        var domain = options.domain ? '; domain=' + options.domain : '';
        var secure = options.secure ? '; secure' : '';
        var ret = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
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

window.kss = window.$k = kss;

})(window);