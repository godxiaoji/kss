/**
 * Kss Javascript Class Library Extend
 * @Author  Travis(LinYongji)
 * @Contact http://travisup.com/
 * @Version 0.0.1
 */
(function(kss) {
    // 动画
    kss.extend({
		// update at 2013.02.16
		// 队列：入队
		queue : function (elem, name, fn) {
			var fns = kss.data(elem, 'queue', name);
			if (!fns || !kss.isArray(fns)) {
				fns = [];
			}
			if (kss.isFunction(fn)) {
				fns.push(fn);
			}
			kss.data(elem, 'queue', name, fns);
		},

		// update at 2013.02.16
		// 队列：出队并执行
		dequeue : function (elem, name) {
			var fns = kss.data(elem, 'queue', name),
			fn;
			if (fns && fns[0]) {
				fn = fns.shift();
				kss.data(elem, 'queue', name, fns);
				fn.call(elem);
			}
		}
	});

	// update at 2012.11.26
	kss.fn.extend({
		animate : function (prop, speed, easing, callback) {
			if (this.length === 0)
				return;

			var opt = kss.speed(speed, easing, callback);

			return kss.each(this, function () {
				if (typeof opt.callback === "function") {
					kss.queue(this, "animatequeue", opt.callback);
				}
				for (var name in prop) {
					if (kss.inArray(name, kss.fxStyle) >= 0) {
						var fx = new kss.fx(this, opt, name);
						var start = parseInt(kss(this).css(name));
						var end = parseInt(prop[name]);
						fx.custom(start, end);
					}
				}
			}, [opt]);
		},

		stop : function () {
			for (var i = timers.length - 1; i >= 0; i--) {
				if (timers[i].elem === this[0]) {
					timers[i].stop();
				}
			}
		}
	});

	var timers = [],
	timerId = null;

	// add at 2012.11.25
	kss.fx = function (elem, options, name) {
		this.elem = elem;
		this.options = options;
		this.name = name;
	};

	// update at 2012.11.26
	kss.fx.prototype = {
		custom : function (from, to) {
			this.startTime = kss.now();
			this.start = from;
			this.end = to;
			timers.push(this);
			kss.fx.tick();
		},

		step : function () {
			var t = kss.now();
			var nowPos;
			if (t > this.startTime + this.options.speed) {
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

		update : function (value) {
			if (this.name !== "opacity") {
				value += "px";
			}
			this.elem.style[this.name] = value;
		},

		stop : function () {
			for (var i = timers.length - 1; i >= 0; i--) {
				if (timers[i] === this) {
					timers.splice(i, 1);
				}
			}
		}
	};

	// update at 2012.11.26
	kss.fx.tick = function () {
		if (timerId)
			return;
		timerId = setInterval(function () {
				for (var i = 0; i < timers.length; i++) {
					timers[i].step();
				}
				if (timers.length === 0) {
					kss.fx.stop();
				}
			}, 13);
	};

	// add at 2012.11.25
	kss.fx.stop = function () {
		clearInterval(timerId);
		timerId = null;
	};

	// add at 2012.11.25
	// from jQuery
	kss.easing = {
		linear : function (p, n, firstNum, diff) {
			return firstNum + diff * p;
		},
		swing : function (p, n, firstNum, diff) {
			return ((-Math.cos(p * Math.PI) / 2) + 0.5) * diff + firstNum;
		}
	};

	kss.extend({

		// add at 2012.11.26
		speed : function (speed, easing, fn) {
			var opt = {
				speed : speed,
				easing : easing || "swing",
				callback : fn || null
			};
			return opt;
		},

		fxStyle : ["opacity", "lineHeight", "height", "width", "top", "bottom", "left", "right", "backgroundPositionX", "backgroundPositionY", "marginTop", "marginBottom", "marginLeft", "marginLeft", "paddingTop", "paddingBottom", "paddingLeft", "paddingRight"]
	});
    
    	// get and cookie
	kss.extend({
		// update at 2012.12.24
		// get param from url
		queryString : function (name) {
			if (!location.search)
				return undefined;

			var search = location.search.substr(1);
			var pathInfo = search.split("&");

			var params = {},
			key,
			value,
			pos;
			for (var i = 0; i < pathInfo.length; i++) {
				pos = pathInfo[i].indexOf("=");
				if (pos > 0) {
					key = pathInfo[i].substring(0, pos);
					value = pathInfo[i].substring(pos + 1);
					params[key] = decodeURIComponent(value);
				}
			}
			if (typeof name === "undefined") {
				if (kss.isEmptyObject(params)) {
					return undefined;
				}
				return params;
			}
			if (params.hasOwnProperty(name)) {
				return params[name];
			} else {
				return undefined;
			}
		},

		// cookie
		cookie : function (name, value, options) {
			if (typeof name === "undefined")
				return null;
			// get
			if (typeof value === "undefined") {
				var cookieValue = null;
				if (document.cookie && document.cookie != "") {
					var cookies = document.cookie.split(";");
					for (var i = 0; i < cookies.length; i++) {
						var cookie = kss.trim(cookies[i]);
						if (cookie.indexOf(name + "=") === 0) {
							cookieValue = cookie.substr(name.length + 1);
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
    
    // 浏览器检测（update at 2012.11.23）
	var clientMatch = function () {
		var ua = navigator.userAgent.toLowerCase(),

		browser = {
			ie : false,
			firefox : false,
			chrome : false,
			webkit : false,
			safari : false,
			opera : false,

			version : ""
		};
		// Opera通过特有属性判断
		if (window.opera) {
			browser.version = window.opera.version();
			browser.opera = true;
			// 其他通过userAgent检测
		} else {
			var match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
				/(webkit)[ \/]([\w.]+)/.exec(ua) ||
				/ms(ie)\s([\w.]+)/.exec(ua) ||
				/(firefox)[ \/]([\w.]+)/.exec(ua) ||
				[];

			if (match[1]) {
				browser[match[1]] = true;
			}
			browser.version = match[2] || "";
			// 在PC端，webkit浏览器不是Chrome/Chromium就是Safari
			if (browser.webkit) {
				browser.safari = true;
				var safariMatch = /version\/([\w.]+)/.exec(ua);
				browser.version = safariMatch[1] || "0";
			}
			if (browser.chrome) {
				browser.webkit = true;
			}
		}

		return browser;
	};

	kss.browser = clientMatch();
})(kss);