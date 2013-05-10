/**
* Kss Javascript Class Library
* @Author  Travis(LinYongji)
* @Contact http://travisup.com/
* @Version 1.1.1
* @needfix: data event
*/
(function( window, undefined ) {

var rootKss,

    document = window.document,
    location = window.location,
    navigator = window.navigator,

    version = "1.1.1",
    class2type = {},
    k_arr = [],

    k_push = k_arr.push,
    k_indexOf = k_arr.indexOf,
    k_splice = k_arr.splice,
    k_sort = k_arr.sort,
    k_toString = class2type.toString,
    k_hasOwn = class2type.hasOwnProperty,
    k_trim = version.trim,

    rIdExpr = /^(?:#([\w-]+))$/,
    rMultiSelector = /^(?:([\w-#\.]+)([\s]?)([\w-#\.\s>]*))$/,

    kss = function( selector, context ) {
        return new init(selector, context);
    },

    // update at 2013.03.13
    init = function( selector, context ) {
        var match, elem;

        // $(undefined/null/""/false)
        if ( !selector ) {
            return this;
        }
        //$(node)
        if ( selector.nodeType ) {
            this.context = this[0] = selector;
            this.length = 1;
            return this;
        }

        if ( typeof selector === "string" ) {
            // $("#id")
            match = rIdExpr.exec( selector );
            if ( match && match[1] && !context ) {
                elem = document.getElementById( match[1] );
                if ( elem && elem.parentNode ) {
                    if ( elem.id !== match[1] ) {
                        return rootKss.find( selector );
                    }
                    this.length = 1;
                    this[0] = elem;
                }
                this.context = document;
                this.selector = selector;
                return this;
            }
            if ( context && context.nodeType === 1 ) {
                this.context = context;
            } else {
                context = document;
            }
            return kss( context ).find( selector );

        // $(document).ready()
        } else if ( typeof selector === "function" && kss.fn.ready ) {
            return rootKss.ready( selector );
        }
    };

kss.fn = {
    constructor: kss,
    selector: "",
    context: document,

    // arrayLike
    length: 0,
    splice: k_splice,
    push: k_push,
    sort: k_sort,

    // 返回节点个数
    size: function() {
        return this.length;
    },

    // 组合Kss(update at 2013.05.09)
    pushStack: function( elems ) {
        var obj = kss(),
            i = 0,
            len = elems.length;
        for ( ; i < len; i++ ) {
            obj[ i ] = elems[ i ];
        }
        obj.length = len;
        return obj;
    },

    // 获取指定后代元素(update at 2013.05.09)
    find: function( selector ) {
        var match,
            i = 0,
            obj,
            len = this.length,
            rets = [];

        match = rMultiSelector.exec( selector );
        if ( match && match[1] ) {
            for ( ; i < len; i++ ) {
                rets = kss.merge( rets, kss.find( match[1], this[ i ] ) );
            }
        }

        // 父集为多个节点时需要排重
        if( len > 1 && rets[1] ) {
            rets = kss.uniq( rets );
        }
        obj = this.pushStack( rets );

        // 还有后代节点继续遍历
        if( obj.length > 0 && match[2] && match[3] ) {
            return obj.find( match[3] );
        }
        return obj;
    },

    // 获取指定子元素(update at 2013.03.14)
    children: function(selector) {
        var elems,
            i = 0,
            len = this.length,
            rets = [];

        for ( ; i < len; i++ ) {
            elems = kss.dir( this[ i ].firstChild, "nextSibling" );

            if ( typeof selector === "string" ) {
                elems = kss.filter( selector, elems );
            }
            rets = kss.merge( rets, elems );
        }
        // 排重
        rets = kss.uniq( rets );
        return this.pushStack( rets );
    },
    
    // 获取所有子节点(update at 2013.04.22)
    contents: function() {
        var elems,
            i = 0,
            len = this.length,
            rets = [];

        for ( ; i < len; i++ ) {
            rets = kss.merge( rets, this[ i ].childNodes );
        }
        // 排重
        rets = kss.uniq( rets );
        return this.pushStack( rets );
    },

    // 获取相应下标的元素对象(update at 2013.02.28)
    eq: function( i ) {
        var len = this.length,
            j = +i + ( i < 0 ? len : 0 );

        return this.pushStack( j >= 0 && j < len ? [this[j]] : [] );
    },

    // 遍历元素并执行函数(update at 2013.02.19)
    each: function( callback, args ) {
        return kss.each( this, callback, args );
    },

    // 处理过滤元素(add at 2013.02.27)
    // 倒过来的(index, element)
    map: function( callback ) {
        return this.pushStack( kss.map(this, function( elem, i ) {
            return callback.call( elem, i, elem );
        }));
    },

    // 删除节点(update at 2013.03.25)
    remove: function() {
        var i = 0,
            len = this.length;

        for ( ; i < len; i++ ) {
            kss.remove( this[ i ] );
        }
        return this;
    }
};

init.prototype = kss.fn;

// 对象继承(update at 2013.05.09)
kss.fn.extend = kss.extend = function() {
    var i = 1,
        k,
        obj,
        target = arguments[0] || {},
        len = arguments.length;

    // 只传第一个参数则把对象继承到kss库中
    if( len === 1 ) {
        target = this;
        --i;
    }
    // 后面所有参数继承到第一个参数里
    for ( ; i < len; i++ ) {
        obj = arguments[ i ];
        if ( typeof obj === "object" ) {
            for ( k in obj ) {
                target[ k ] = typeof target[ k ] === "object" && typeof obj[ k ] === "object" ?
                    kss.extend( target[ k ], obj[ k ] ) :
                    obj[ k ];
            }
        }
    }
    return target;
};

kss.extend({
    // 判断类型(add at 2013.05.03)
    type: function( obj ) {
        if( obj == null ) {
            return String( obj );
        }
        return typeof obj === "object" || typeof obj === "function" ?
            class2type[ k_toString.call( obj ) ] || "object" :
            typeof obj;
    },

    // 判断是否为函数(add at 2013.05.03)
    isFunction: function( obj ) {
        return kss.type( obj ) === "function";
    },

    // 判断是否为数组(add at 2013.05.03)
    isArray: function( obj ) {
        return kss.type( obj ) === "array";
    },

    // 判断是否为数字(包含只含数字的字符串)(add at 2012.11.20)
    isNumeric: function( obj ) {
        return !isNaN( parseFloat( obj ) ) && isFinite( obj );
    },

    // 判断是否为空对象(add at 2012.11.22)
    isEmptyObject: function( obj ) {
        var i;
        for ( i in obj ) {
            return false;
        }
        return true;
    },

    // 判断是否为kss封装的对象(add at 2013.02.27)
    isKssObject: function( obj ) {
        return obj.constructor == kss && typeof obj.length === "number";
    },

    // 判断是否为标量(add at 2013.02.19)
    isScalar: function( obj ) {
        return typeof obj === "string" || typeof obj === "number" || typeof obj === "boolean";
    }
});

kss.extend({
    // 对对象和数组进行callback操作(update at 2013.02.27)
    map: function( elems, callback ) {
        var value,
        i = 0,
        len,
        rets = [];
        // 伪数组和数组采用索引遍历
        if ( kss.isKssObject( elems ) || kss.isArray( elems ) ) {
            for ( len = elems.length; i < len; i++ ) {
                value = callback( elems[ i ], i );
                if ( value != null ) {
                    rets.push( value );
                }
            }
        // 遍历对象
        } else {
            for ( i in elems ) {
                value = callback( elems[ i ], i );
                if ( value != null ) {
                    rets.push( value );
                }
            }
        }
        return rets;
    },

    // kss对象遍历(update at 2013.05.09)
    each: function(obj, callback, args) {
        var i = 0,
            len = obj.length;
        
        if ( args ) {
            if ( kss.isKssObject( obj ) ) {
                for ( ; i < len; i++ ) {
                    if ( callback.apply( obj[ i ], args ) === false ) {
                        break;
                    }
                }
            } else {
                for ( i in obj ) {
                    if ( callback.apply( obj[ i ], args ) === false ) {
                        break;
                    }
                }
            }
        } else {
            if ( kss.isKssObject( obj ) ) {
                for ( ; i < len; i++ ) {
                    if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
                        break;
                    }
                }
            } else {
                for ( i in obj ) {
                    if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
                        break;
                    }
                }
            }
        }
        return obj;
    }
});

kss.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
    class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

kss.fn.extend({
    // 获取元素父节点(update at 2012.11.21)
    parent: function() {
        var rets = [],
            elem,
            i = 0,
            len = this.length;

        for ( ; i < len; i++ ) {
            elem = this[ i ].parentNode;
            if ( elem && elem.nodeType !== 11 ) {
                rets.push( elem );
            }
            // 清除重复
            rets = kss.uniq( rets );
        }
        return this.pushStack( rets );
    },

    // 返回元素之后第一个兄弟节点(add 2013.02.25)
    next: function() {
        return this[0] ? this.pushStack( kss.dir( this[0], "nextSibling", this[0], true ) ) : kss();
    },

    // 返回元素之后所有兄弟节点(add 2013.02.25)
    nextAll: function() {
        return this[0] ? this.pushStack( kss.dir( this[0], "nextSibling", this[0] ) ) : kss();
    },

    // 返回元素之前第一个兄弟节点(add 2013.02.25)
    prev: function() {
        return this[0] ? this.pushStack( kss.dir( this[0], "previousSibling", this[0], true ) ) : kss();
    },

    // 返回元素之前所有兄弟节点(add 2013.02.25)
    prevAll: function() {
        return this[0] ? this.pushStack( kss.dir( this[0], "previousSibling", this[0] ) ) : kss();
    },

    // 返回除自身以外所有兄弟节点(add 2013.02.25)
    siblings: function() {
        return this[0] ? this.pushStack( kss.dir( this[0].parentNode.firstChild, "nextSibling", this[0] ) ) : kss();
    }
});

kss.fn.extend({
    // 处理数据插入(update 2013.04.17)
    // 注：没处理ie6的tbody插入问题
    domManip: function( args, callback ) {
        var frag, nodes, clone,
            i = 0,
            len = this.length;
        if( len === 0 ) {
            return this;
        }
        if( typeof args[0] === "string" ) {
            nodes = kss.parseNodes( args[0] );
            frag = kss.buildFragment( nodes );
        } else if( args[0] && args[0].nodeType ) {
            frag = nodes = args[0];
        }
        if( frag ) {
            for( ; i < len; i++ ) {
                clone = frag.cloneNode( true );
                callback.call( this[ i ], clone );
            }
        }
        frag = clone = null;
        return this;
    },
    // 在元素里面内容的末尾插入内容(update 2013.04.17)
    append: function() {
        return this.domManip( arguments, function( elem ) {
            this.appendChild( elem );
        });
    },
    // 在元素里面内容的前面插入内容(update(update 2013.04.17)
    prepend: function() {
        return this.domManip( arguments, function( elem ) {
            this.insertBefore( elem, this.firstChild );
        });
    },
    // 在元素之前插入内容(update(update 2013.04.17)
    before: function() {
        return this.domManip( arguments, function( elem ) {
            if ( this.parentNode ) {
                this.parentNode.insertBefore( elem, this );
            }
        });
    },
    // 在元素之后插入内容(update(update 2013.04.17)
    after: function() {
        return this.domManip( arguments, function( elem ) {
            if ( this.parentNode ) {
                this.parentNode.insertBefore( elem, this.nextSibling );
            }
        });
    }
});

kss.extend({
    // 解析字符串为dom节点(update 2013.04.17)
    parseNodes: function( data ) {
        var wrap = document.createElement("div"),
            rets = [],
            cur;
        wrap.innerHTML = data;
        cur = wrap.firstChild;
        while ( cur && cur.nodeType !== 9 ) {
            rets.push( cur );
            cur = cur.nextSibling;
        }
        wrap = null;
        return rets;
    },
    // 返回节点集合(update 2013.04.17)
    buildFragment: function( nodes ) {
        var frag = document.createDocumentFragment(),
            i = 0,
            len = nodes.length;
        for( ; i < len; i++ ) {
            frag.appendChild( nodes[ i ] );
        }
        return frag;
    }
});

var rQuickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
    rTagClass = /^(?:(\w*)\.([\w-]+))$/;

kss.extend({
    // 选择器(update 2013.05.09)
    find: function( selector, parentNode ) {
        var match,
        i,
        m,
        elem,
        elems,
        rets,
        tag;

        rets = [];
        // 快速匹配
        match = rQuickExpr.exec( selector );
        if ( match ) {
            // $("#id")
            if ( (m = match[1]) ) {
                if ( parentNode.nodeType === 9 ) {
                    elem = document.getElementById( m );
                    if ( elem && elem.parentNode ) {
                        if ( elem.id === m ) {
                            rets.push( elem );
                        } else {
                            //解决低版本ie和某些opera id和name混淆的问题
                            elems = document.all[ m ];
                            if ( elems && elems.length ) {
                                for ( i = 1; i < elems.length; i++ ) {
                                    if ( elems[ i ].attributes["id"].value === m ) {
                                        rets.push( elems[ i ] );
                                    }
                                }
                            }
                        }
                    }
                } else {
                    if ( parentNode.ownerDocument && (elem = parentNode.ownerDocument.getElementById( m )) && elem.id === m ) {
                        rets.push( elem );
                    }
                }
                return rets;
            // $("tag")
            } else if ( (m = match[2]) ) {
                kss.merge( rets, parentNode.getElementsByTagName( m ) );
                return rets;
            // $(".class")
            } else if ( (m = match[3]) && parentNode.getElementsByClassName ) {
                kss.merge( rets, parentNode.getElementsByClassName( m ) );
                return rets;
            }
        }
        // 高级匹配
        // $("tag.class")
        match = rTagClass.exec( selector );
        if ( match && (m = match[2]) ) {
            tag = match[1] || "*";
            elems = tag === "*" && parentNode.all ? parentNode.all : parentNode.getElementsByTagName( tag );
            for ( i = 0; i < elems.length; i++ ) {
                if ( kss.hasClass( elems[ i ], m ) ) {
                    rets.push( elems[ i ] );
                }
            }
            return rets;
        }
        return rets;
    },
    // 过滤选择器(update 2013.03.14)
    filter: function( selector, elems ) {
        var match,
        m,
        tag,
        i = 0,
        len = elems.length,
        rets = [];

        // 快速匹配
        match = rQuickExpr.exec( selector );
        if ( match ) {
            // $("#id")
            if ( (m = match[1]) ) {
                for ( ; i < len; i++ ) {
                    if ( elems[ i ].id == m ) {
                        rets[0] = elems[ i ];
                        break;
                    }
                }
            // $("tag")
            } else if ( (m = match[2]) ) {
                for ( ; i < len; i++ ) {
                    if ( elems[ i ].tagName == m.toUpperCase() ) {
                        rets.push( elems[ i ] );
                    }
                }
            // $(".class")
            } else if ( (m = match[3]) ) {
                for ( ; i < len; i++ ) {
                    if ( kss.hasClass( elems[ i ], m ) ) {
                        rets.push( elems[ i ] );
                    }
                }
            }
        } else {
            // 高级匹配
            // $("tag.class")
            match = rTagClass.exec( selector );
            if ( match && (tag = match[1]) && (m = match[2]) ) {
                for ( ; i < len; i++ ) {
                    if ( kss.hasClass( elems[ i ], m ) && elems[ i ].tagName === tag.toUpperCase() ) {
                        rets.push( elems[ i ] );
                    }
                }
                return rets;
            }
        }
        return rets;
    },
    // 筛选节点(add 2013.02.25)
    dir: function( elem, dir, besides, one ) {
        var matched = [],
            cur = elem;
        while ( cur && cur.nodeType !== 9 ) {
            if ( cur.nodeType === 1 && cur !== besides ) {
                matched.push( cur );
                if ( one ) {
                    return matched;
                }
            }
            cur = cur[ dir ];
        }
        return matched;
    }
});

kss.fn.extend({
    // 读取设置节点内容(update at 2013.03.25)
    html: function( value ) {
        if ( typeof value === "undefined" ) {
            return this[0] && this[0].nodeType === 1 ? this[0].innerHTML : null;
        }
        // 注：ie table等不支持写入，这里没做兼容
        if ( kss.isScalar( value ) ) {
            return kss.each( this, function() {
                if ( this.nodeType === 1 ) {
                    try {
                        this.innerHTML = value;
                    } catch(e) {
                        kss.error("innerHTML only read on IE6.");
                    }
                }
            });
        }
        return this;
    },
    // 读取设置节点文本内容(update at 2013.04.22)
    text: function( value ) {
        // 注：textContent !== innerText
        if ( typeof value === "undefined" ) {
            return this[0] && this[0].nodeType === 1 ?
                typeof this[0].textContent === "string" ? this[0].textContent : this[0].innerText :
                "";
        }
        if ( kss.isScalar( value ) ) {
            return kss.each( this, function() {
                if ( this.nodeType === 1 ) {
                    if ( typeof this.textContent === "string" ) {
                        this.textContent = value;
                    } else {
                        this.innerText = value;
                    }
                }
            });
        }
        return this;
    },
    // 读取设置表单元素的值(update at 2013.03.25)
    val: function( value ) {
        if ( typeof value === "undefined" ) {
            return this[0] && this[0].nodeType === 1 && typeof this[0].value !== "undefined" ?
                this[0].value :
                undefined;
        }
        if ( kss.isScalar( value ) ) {
            return kss.each( this, function() {
                if ( typeof this.value !== "undefined" ) {
                    this.value = value;
                }
            });
        }
        return this;
    },
    // 对应元素读取或写入缓存数据(add at 2013.04.22)
    data: function( name, value ) {
        if ( typeof value === "undefined" ) {
            return kss.data( this[0], "data", name );
        }
        return kss.each( this, function() {
            kss.data( this, "data", name, value, true );
        });
    },
    // 对应元素删除缓存数据(add at 2013.04.22)
    removeData: function( name ) {
        return kss.each( this, function() {
            kss.removeData( this, "data", name );
        });
    }
});

// JSON正则校验公式
var rValidchars = /^[\],:{}\s]*$/,
    rValidbraces = /(?:^|:|,)(?:\s*\[)+/g,
    rValidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
    rValidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g,
    rTrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g ;

kss.extend({
    // 获取当前时间戳(add at 2012.11.25)
    now: function() {
        return ( new Date() ).getTime();
    },
    // 随机生成数(add at 2013.02.20)
    rand: function( len ) {
        return Math.random().toString().substr( 2, len );
    },
    // 判断是否在数组中(update at 2013.03.15)
    inArray: function( value, arr, start ) {
        var i,
            len = arr.length;
        if ( typeof start !== "number" ) {
            start = 0;
        } else if ( start < 0 ) {
            start = Math.max( 0, len + start );
        }
        for ( i = start; i < len; i++ ) {
            if ( arr[ i ] === value )
                return i;
        }
        return -1;
    },
    // 清除数组中重复的数据(update at 2013.02.28)
    uniq: function( arr ) {
        var rets = [],
            i = 0,
            len = arr.length;
        if ( kss.isArray( arr ) ) {
            for ( ; i < len; i++ ) {
                if ( kss.inArray( arr[ i ], rets ) === -1) {
                    rets.push( arr[ i ] );
                }
            }
        }
        return rets;
    },
    // 数组拼接(update at 2013.02.28)
    merge: function( first, second ) {
        var i = first.length,
            j = 0,
            len = second.length;
        for ( ; j < len; j++ ) {
            first[ i++ ] = second[ j ];
        }
        return first;
    },
    // 清除两边空格(update at 2013.05.10)
    // 注：包括BOM和&nbsp;
    trim: k_trim && !k_trim.call("\uFEFF\xA0") ?
        function( text ) {
            return text == null ? "" : k_trim.call( text );
        } :
        function( text ) {
            return text == null ? "" : ( text + "" ).replace( rTrim, "" );
        },
    // 删除节点(add at 2012.12.14)
    remove: function( elem ) {
        var parent = elem.parentNode;
        if ( parent && parent.nodeType !== 11 ) {
            parent.removeChild( elem );
        }
    },
    // 解析json(update at 2013.04.01)
    parseJSON: function( data ) {
        if ( window.JSON && window.JSON.parse ) {
            return window.JSON.parse( data );
        }
        if ( data === null ) {
            return data;
        }
        
        if ( typeof data === "string" ) {
            data = kss.trim( data );

            if ( data ) {
                if ( rValidchars.test( data.replace(rValidescape, "@")
                    .replace( rValidtokens, "]" )
                    .replace( rValidbraces, "")) ) {
                    return ( new Function( "return " + data ) )();
                }
            }
        }
        kss.error( "Invalid JSON: " + data );
    },
    // 置空函数(add at 2013.04.27)
    noop: function() {
    },
    // 抛出错误(add at 2012.12.14)
    error: function( msg ) {
        throw new Error( msg );
    }
});

kss.extend({
    // 全局缓存(add at 2013.02.15)
    cache : {},
    // 全局索引
    guid : 1,
    // 内部Key
    expando : "kss" + kss.rand(),
    // 获取数据索引(update at 2013.03.18)
    getCacheIndex: function( elem, isSet ) {
        var id = kss.expando;
        if( elem.nodeType === 1 ) {
            return elem[ id ] || !isSet ? elem[id] : ( elem[ id ] = ++kss.guid );
        }
        return elem.nodeType === 9 ? 1 : 0;
    },
    // 读取/缓存数据操作(update at 2013.03.27)
    data: function( elem, type, name, value, overwrite ) {
        var cache = kss.cache,
            isRead = typeof value === "undefined" ? true: false,
            index = kss.getCacheIndex(elem, !isRead);
            
        if( isRead ) {
            return index && cache[ index ] && cache[ index ][ type ] && cache[ index ][ type ][ name ] || undefined;
        }
        
        cache = cache[ index ] = cache[ index ] || {};
        
        if( !cache[ type ] ) {
            cache[ type ] = {};
        }
        
        if( overwrite || typeof cache[ type ][ name ] === "undefined" ) {
            cache[ type ][ name ] =  value;
        }
        
        return cache[ type ][ name ];
    },
    // 删除数据操作(update at 2013.03.18)
    removeData: function( elem, type, name ) {
        var data,
            cache = kss.cache,
            index = kss.getCacheIndex( elem );
            
        if( index && (data = cache[ index ]) ) {
            if( data[ type ] ) {
                if(name) {
                    delete data[ type ][ name ];
                } else {
                    delete data[ type ];
                }
            }
            
            if( kss.isEmptyObject( data[ type ] ) ) {
                delete data[ type ];
            }
        }
    },
    // 深度复制(update at 2013.05.10)
    clone: function( obj ) {
        var i,
            clone = obj;
        
        if ( kss.isArray( obj ) ) {
            i = obj.length;
            clone = [];
            while ( i-- ) {
                clone[ i ] = arguments.callee.call( null, obj[ i ] );
            }
            return clone;
        } else if ( kss.type( obj ) === "object" ) {
            clone = {};
            for ( i in obj ) {
                clone[ i ] = arguments.callee.call( null, obj[ i ] );
            }
            return clone;
        }
        return clone;
    }
});

// 事件函数(add at 2013.02.22)
kss.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
        "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
        "change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {
    kss.fn[name] = function( data, fn ) {
        return arguments.length > 0 ?
            this.on( name, null, data, fn ) :
            this.trigger( name );
    };
});

kss.fn.extend({
    // 事件绑定(bind/live/delegate add 2013.02.15)
    on: function( type, selector, data, fn ) {
        if ( typeof type !== "string" || type == "" ) {
            return this;
        }
        // (type, fn)
        if ( data == null && fn == null ) {
            fn = selector;
            data = selector = undefined;
            // (type, fn)
        } else if ( fn == null ) {
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
        if ( !kss.isFunction( fn ) ) {
            fn = returnFalse;
        }
        return kss.each( this, function() {
            kss.event.add( this, type, selector, data, fn);
        }, [ type, selector, data, fn ] );
    },
    // 事件解绑(unbind/die/undelegate add 2013.02.15)
    off: function( type, selector, fn ) {
        if ( typeof type !== "string" || type == "" ) {
            return this;
        }

        // (type[, fn])
        if ( !selector || kss.isFunction( selector ) ) {
            fn = selector;
            selector = undefined;
        }

        if ( !fn ) {
            fn = undefined;
        }
        return kss.each( this, function() {
            kss.event.remove( this, type, selector, fn );
        }, [ type, selector, fn ] );
    },
    // 触发事件(update at 2013.03.25)
    trigger: function( type ) {
        return kss.each( this, function() {
            kss.event.trigger( this, type );
        });
    },
    // 文档完成事件(update at 2013.05.10)
    ready: function( fn ) {
        if( kss.isFunction( fn ) ) {
            if ( kss.isReady ) {
                fn.call( document, kss );
            } else if ( readyList ) {
                readyList.push( fn );
                if( !readyBound ) {
                    readyAttach();
                }
            }
        }
        return this;
    }
});

// 返回false函数(add at 2013.02.16)
function returnFalse() {
    return false;
}

kss.event = {
    // 事件绑定(update at 2013.02.20)
    add: function( elem, type, selector, data, fn ) {
        var handleObj = {},
            handler,
            events,
            id = kss.expando;
        // 事件委托
        if ( selector ) {
            handler = function( e ) {
                var elems = kss( elem ).find( selector ),
                evt = window.event ? window.event : e,
                target = evt.target || evt.srcElement;
                // 统一事件阻止
                evt.stopPropagation = evt.stopPropagation || function() {
                    window.event.cancelBubble = true;
                };
                evt.data = data;
                for ( var i = 0; i < elems.length; i++ ) {
                    if ( elems[ i ] == target ) {
                        return fn.call( target, evt );
                    }
                }
            }
            // 直接绑定
        } else {
            handler = function( e ) {
                var evt = window.event ? window.event : e;
                evt.stopPropagation = evt.stopPropagation || function() {
                    window.event.cancelBubble = true;
                };
                evt.data = data;
                return fn.call( elem, evt );
            };
        }

        // 事件缓存
        fn[ id ] = kss.getCacheIndex( elem, true );
        events = kss.data( elem, "events", type, [] );

        handleObj.handler = handler;
        handleObj.selector = selector;
        handleObj.data = data;
        handleObj.guid = fn[ id ];

        events.push( handleObj );

        if ( window.addEventListener ) {
            elem.addEventListener( type, handler, false );
        } else if ( document.attachEvent ) {
            elem.attachEvent( "on" + type, handler );
        } else {
            elem[ "on" + type ] = handler;
        }
    },

    // 事件解绑(update at 2013.02.15)
    remove: function( elem, type, selector, fn ) {
        var handleObj,
            handler,
            id = kss.expando,
            events = kss.data( elem, "events", type ),
            i = 0;
        if ( !elem[ id ] || !events ) {
            return;
        }
        if ( kss.isFunction( fn ) && !fn[ id ] ) {
            return;
        }
        
        for ( ; i < events.length; i++ ) {
            handleObj = events[ i ];
            if ( typeof fn === "undefined" ||
                (typeof selector !== "undefined" && handleObj.selector === selector && fn[ id ] === handleObj.guid) ||
                (typeof selector === "undefined" && fn[ id ] === handleObj.guid) ) {

                handler = handleObj.handler;

                if ( elem.removeEventListener ) {
                    elem.removeEventListener( type, handler, false );
                } else if ( document.detachEvent ) {
                    elem.detachEvent( "on" + type, handler );
                } else {
                    elem[ "on" + type ] = null;
                }
                events.splice( i, 1 );
            }
        }
        
        if( events.length === 0 ) {
            kss.removeData( elem, "events", type );
        }
    },

    // 模拟事件点击(update at 2013.03.25)
    trigger: function( elem, type ) {
        var i = 0,
            events, len, event, parent, isPropagationStopped;

        events = kss.data( elem, "events", type );

        if( events ) {
            // 修正Event对象
            event = {
                target: elem,
                currentTarget: elem,
                type: type,            
                stopPropagation: function(){
                    isPropagationStopped = true;
                }
            };

            for( len = events.length; i < len; i++ ){
                events[ i ].handler.call( elem, event );
            }

            parent = elem.parentNode;
            // 模拟事件冒泡
            if ( parent && !isPropagationStopped ) {
                kss.event.trigger( parent, type );
            }
        }
    }
};

// 判断Dom载完(update at 2013.05.09)
var readyList = [],
    readyBound = false,

    completed = function( event ) {
        if ( document.addEventListener || event.type === "load" || document.readyState === "complete" ) {
            readyDetach();
            kss.ready();
        }
    },
    readyDetach = function() {
        if ( document.addEventListener ) {
            document.removeEventListener( "DOMContentLoaded", completed, false );
            window.removeEventListener( "load", completed, false );

        } else {
            document.detachEvent( "onreadystatechange", completed );
            window.detachEvent( "onload", completed );
        }
    },
    readyAttach = function() {
        var top = false;

        readyBound = true;

        if ( document.readyState === "complete" ) {
            return kss.ready();
        } else if ( document.addEventListener ) {
            document.addEventListener( "DOMContentLoaded", completed, false );
            window.addEventListener( "load", completed, false );
        } else if ( document.attachEvent ) {
            document.attachEvent( "onreadystatechange", completed );
            window.attachEvent( "onload", completed );

            try {
                top = window.frameElement == null && document.documentElement;
            } catch ( e ) {}
            if ( top && top.doScroll ) {
                (function doScrollCheck() {
                    if ( !kss.isReady ) {
                        try {
                            top.doScroll("left");
                        } catch(e) {
                            return setTimeout( doScrollCheck, 50 );
                        }
                        readyDetach();
                        kss.ready();
                    }
                })();
            }
        }
    };

kss.extend({

    isReady: false,

    ready: function() {
        var i = 0,
            len = readyList.length;

        if ( !kss.isReady ) {
            if ( !document.body ) {
                return setTimeout( kss.ready, 13 );
            }
            kss.isReady = true;

            for ( ; i < len; i++ ) {
                readyList[ i ].call( document, kss );
            }
            readyList = [];
        }
    }
});

// 属性操作原型链
kss.fn.extend({
    // 读取或设置元素属性(update at 2013.02.19)
    attr: function( name, value ) {
        if (typeof name !== "string") {
            return this;
        }
        if ( typeof value === "undefined" ) {
            return this[0] && this[0].nodeType === 1 ? this[0].getAttribute( name ) : undefined;
        } else if ( kss.isScalar( value ) ) {
            return kss.each( this, function() {
                kss.setAttr( this, name, value );
            });
        }
        return this;
    },
    // 删除元素指定属性(update at 2013.02.19)
    removeAttr: function( name ) {
        if ( typeof name !== "string" ) {
            return this;
        }
        return kss.each( this, function() {
            kss.removeAttr( this, name );
        });
    },
    // 特殊属性处理(update at 2013.02.19)
    prop: function(name, value) {
        var prop;
        if ( typeof value === "undefined" ) {
            prop = this.attr( name );
            if ( kss.inArray( name, propAttr ) >= 0 ) {
                return typeof prop === "string" && (prop === name || prop === "");
            }
            return prop;
        }
        if ( kss.inArray( name, propAttr ) >= 0 && typeof value === "boolean" ) {
            if ( value ) {
                value = name;
            } else {
                return this.removeAttr( name );
            }
        }
        return this.attr( name, value );
    }
});

var propAttr = [ "disabled", "checked", "selected", "multiple", "readonly", "async", "autofocus" ];

// 属性操作
kss.extend({
    // 设置元素属性(只支持元素 update at 2013.02.19)
    setAttr: function( elem, name, value ) {
        if ( elem.nodeType === 1 ) {
            elem.setAttribute( name, value );
        }
    },
    // 删除元素指定属性(只支持元素 update at 2013.02.19)
    removeAttr: function( elem, name ) {
        if ( elem.nodeType === 1 ) {
            elem.removeAttribute( name );
        }
    }
});

// 样式操作原型链
kss.fn.extend({
    // 判断元素是否有对应Class(update at 2013.05.10)
    // 只要其中一个有就返回true
    hasClass: function( className ) {
        var i = 0,
            len = this.length;
        for ( ; i < len; i++ ) {
            if ( kss.hasClass( this[ i ], className ) ) {
                return true;
            }
        }
        return false;
    },
    // 添加Class(update at 2013.02.19)
    addClass: function( className ) {
        return kss.each( this, function() {
            kss.addClass( this, className );
        });
    },
    // 删除Class(update at 2013.02.19)
    removeClass: function( className ) {
        return kss.each( this, function() {
            kss.removeClass( this, className );
        });
    },
    // 添加删除样式(add at 2013.04.25)
    toggleClass: function( className, state ) {
        return kss.each( this, function() {
            if( typeof state !== "boolean" ) {
                state = !kss.hasClass( this, className );
            }
            if( state ) {
                kss.addClass( this, className );
            } else {
                kss.removeClass( this, className );
            }
        });
    },
    // 读取或这是元素对应样式(update at 2012.11.22)
    // GET: only get the first node current css
    css: function( name, value ) {
        if ( typeof value === "undefined" ) {
            if ( this[0] && this[0].nodeType === 1 ) {
                return kss.curCss( this[0], name );
            } else {
                return undefined;
            }
        }
        return kss.each( this, function() {
            kss.setCss( this, name, value );
        });
    },
    // 显示元素(add at 2012.11.26)
    show: function() {
        return kss.each( this, function() {
            kss.show( this );
        });
    },
    // 隐藏元素(add at 2012.11.26)
    hide: function() {
        return kss.each( this, function() {
            kss.hide( this );
        });
    }
});

// 样式操作
kss.extend({
    // 判断元素是否有对应Class(add at 2013.02.19)
    hasClass: function( elem, className ) {
        return elem.nodeType === 1 && (" " + elem.className + " ").indexOf(" " + className + " ") >= 0;
    },

    // 添加Class(add at 2013.02.19)
    addClass: function( elem, className ) {
        if ( elem.nodeType === 1 && !kss.hasClass( elem, className ) ) {
            elem.className = kss.trim( elem.className + " " + className + " " );
        }
    },
    // 删除Class(add at 2013.02.19)
    removeClass: function( elem, className ) {
        if ( elem.nodeType === 1 ) {
            elem.className = kss.trim( (" " + elem.className + " ").replace(" " + className + " ", " ") );
        }
    },
    // 显示元素(update at 2013.03.27)
    show: function( elem ) {
        var old = kss.data( elem, "style", "olddisplay" ),
            value;
        elem.style.display = old || "";
        value = kss.curCss( elem, "display" );
        if ( value == "none" ) {
            // 非内联样式中如果设置了display:none，无论是原来是哪种盒子模型，都设置为block(暂定)
            elem.style.display = "block";
        }
    },
    // 隐藏元素(update at 2013.03.27)
    hide: function( elem ) {
        var value = kss.curCss( elem, "display" );
        if ( value != "none" ) {
            kss.data( elem, "style", "olddisplay", value, true );
        }
        elem.style.display = "none";
    },

    // 设置CSS(add at 2012.11.22)
    setCss: function( elem, name, value ) {
        if ( elem.nodeType !== 1 || typeof name !== "string" || typeof value !== "string" ) {
            return;
        }
        if ( typeof elem.style[ name ] !== "undefined" ) {
            elem.style[ name ] = value;
        }
    }
});

// 获取当前CSS(update at 2013.04.22)
var rPosition = /^(top|right|bottom|left)$/,
    rNumnopx = /(em|pt|mm|cm|pc|in|ex|rem|vw|vh|vm|ch|gr)$/i;

if( window.getComputedStyle ) {
    kss.getStyles = function( elem ) {
        return window.getComputedStyle( elem, null );
    };

    kss.curCss = function( elem, name ) {
        var computed = kss.getStyles( elem );
        ret = computed ? computed.getPropertyValue( name ) || computed[ name ] : undefined;
        return ret;
    };
}
else if( document.documentElement.currentStyle ) {
    kss.getStyles = function( elem ) {
        return elem.currentStyle;
    };

    kss.curCss = function( elem, name ) {
        name = camelCase(name);
        var left, rs, rsleft,
            computed = kss.getStyles( elem ),
            ret = computed ? computed[ name ] : undefined,
            style = elem.style;

        if ( ret == null && style && style[ name ] ) {
            ret = style[ name ];
        }
        // opacity

        // 宽高属性单位auto转化为px
        if ( /^(height|width)$/.test(name) && !/(px)$/.test(ret) ) {
            ret = name == "width" ? elem.offsetWidth : elem.offsetHeight;
            if ( ret <= 0 || ret == null ) {
                var pSide = name == "width" ? ["left", "right"] : ["top", "bottom"];
                var client = parseFloat( elem[ camelCase("client-" + name) ] ),
                paddingA = parseFloat( kss.curCss( elem, "padding-" + pSide[0] ) ),
                paddingB = parseFloat( kss.curCss( elem, "padding-" + pSide[1] ) );
                ret = (client - paddingA - paddingB);
            }
            return ret + "px";
        }
        // 非px属性转化为px
        // From the awesome hack by Dean Edwards
        if( rNumnopx.test(ret) && !rPosition.test(name) ) {
            left = style.left;
            rs = elem.runtimeStyle;
            rsLeft = rs && rs.left;

            if( rsLeft ) {
                rs.left = computed.left;
            }

            style.left = name === "fontSize" ? "1em" : ret;
            ret = style.pixelLeft + "px";

            style.left = left;
            if ( rsLeft ) {
                rs.left = rsLeft;
            }
        }
        return ret === "" ? "auto" : ret;
    };
}
// 将样式属性转为驼峰式(add at 2012.11.26)
function camelCase( name ) {
    return name.replace(/\-(\w)/g, function( all, letter ) {
        return letter.toUpperCase();
    });
}

// 数据请求
kss.extend({
    // 远程json获取(update at 2013.03.01)
    getJSON: function( url, data, fn ) {
        return kss.get( url, data, fn, "jsonp" );
    },

    // 载入远程JS并执行回调(update at 2013.03.01)
    getScript: function( url, data, fn ) {
        return kss.get( url, data, fn, "script" );
    },

    // get封装(update at 2013.03.10)
    get: function( url, data, fn, type ) {
        // (url, fn, type)
        if ( kss.isFunction( data ) ) {
            type = type || fn;
            fn = data;
            data = undefined;
        }
        return kss.ajax({
            url: url,
            data: data,
            success: fn,
            dataType: type
        });
    },

    // ajax(update at 2013.03.10)
    ajax: function( url, settings ) {
        var i,
            s,
            params;
        if ( typeof url === "object" ) {
            settings = url;
            url = undefined;
        }
        // 合并参数项
        s = typeof settings === "object" ? settings : {};

        if ( typeof url === "string" ) {
            s.url = url;
        }

        for ( i in ajax.settings ) {
            if ( typeof s[ i ] === "undefined" ) {
                s[ i ] = ajax.settings[ i ];
            }
        }

        if ( s.type !== "POST" ) {
            params = ajax.buildParams( s.data );

            if ( s.cache === false ) {
                params = [ params, "_=" + kss.now() ].join("&");
            }
            s.url += ( s.url.indexOf("?") === -1 ? "?" : "&" ) + params;
        }

        if ( s.dataType === "script" || s.dataType === "jsonp" ) {
            transports.script.send( s );
        } else {
            transports.xhr.send( s );
        }
    }
});

var ajax = {
    xhr: window.XMLHttpRequest && ( window.location.protocol !== "file:" || !window.ActiveXObject ) ?
        function() {
            return new window.XMLHttpRequest();
        } :
        function() {
            try {
                return new window.ActiveXObject("Microsoft.XMLHTTP");
            } catch (e) {}
        },

    settings: {
        url : "",
        type : "GET",
        data : "",
        async : true,
        cache: false,
        timeout : 0,
        contentType : "application/x-www-form-urlencoded",
        parseDate : true,
        dataType : "*",
        context : document,
        beforeSend: function( xhr ) {},
        success: function( data, status ) {},
        error: function( xhr, status ) {},
        complete: function( xhr, status ) {}
    },

    // 将Data转换成字符串(update 2013.02.28)
    buildParams: function( obj ) {
        var i,
            j,
            k,
            len,
            arr = [];
        // 字符串直接返回
        if ( typeof obj === "string" ) {
            return obj;
        } else if ( typeof obj === "object" ) {
            for ( i in obj ) {
                // 处理数组 {arr:[1, 2, 3]} => arr[]=1&arr[]=2&arr[]=3
                if ( kss.isArray( obj[ i ] ) ) {
                    k = i + i.substr( -2, 2 ) === "[]" ? "" : "[]";
                    for ( j = 0, len = obj[ i ].length; j < len; j++ ) {
                        arr.push( k + "=" + encodeURIComponent( obj[ i ][j] + "" ) );
                    }
                } else {
                    arr.push( i + "=" + encodeURIComponent( obj[ i ] + "" ) );
                }
            }
        }
        return arr.join("&");
    },

    httpData: function( xhr, type ) {
        var ct = xhr.getResponseHeader("content-type") || "";
        if ( !type && ct.indexOf("xml") >= 0 || type.toLowerCase() == "xml" ) {
            return xhr.responseXML;
        }
        if ( type === "json" ) {
            return kss.parseJSON( xhr.responseText );
        }
        return xhr.responseText;
    }
};

// 传送器
var transports = {
    // ajax发送请求(update 2013.03.10)
    xhr: {
        send: function( s ) {
            var xhr = ajax.xhr(),
                params;
            // 发送前执行函数
            s.beforeSend.call( s.context, xhr );
            // 监听返回
            xhr.onreadystatechange = function() {
                transports.xhr.callback( xhr, s );
            };
            // GET方法处理
            if ( s.type === "GET" ) {
                xhr.open( s.type, s.url, s.async );
                xhr.send();
                // POST方法处理
            } else if ( s.type === "POST" ) {
                xhr.open( s.type, s.url, s.async );
                xhr.setRequestHeader( "Content-type", s.contentType );
                params = ajax.buildParams( s.data );
                xhr.send( params );
            }
        },

        callback: function( xhr, s ) {
            if (xhr.readyState === 4) {
                xhr.onreadystatechange = kss.noop;
                if ( xhr.status >= 200 && xhr.status < 300 || xhr.status === 304 ) {
                    s.success.call( s.context, ajax.httpData( xhr, s.dataType ), xhr.status );
                } else {
                    s.error.call( s.context, xhr, xhr.status );
                }
                s.complete.call( s.context, xhr, xhr.status );
            }
        }
    },
    // script动态载入(update 2013.03.10)
    script: {
        send: function( s ) {
            var match,
                name,
                script = document.createElement("script"),
                head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;

            if ( s.dataType === "jsonp" ) {
                s.url = s.url.replace("callback=%3F", "callback=?");
                match = /callback=([\w?]+)/.exec( s.url );

                if ( match && match[0] ) {
                    name = match[1] && match[1] !== "?" ? match[1] : "kss" + kss.rand() + "_" + kss.now();
                    s.url = s.url.replace( "callback=?", "callback=" + name );

                    window[ name ] = function(json) {
                        json = s.parseData ? kss.parseJSON( json ) : json;
                        s.success.call( s.context, json );
                        try {
                            window[ name ] = null;
                            delete window[ name ];
                        } catch (e) {}
                    };
                }
            }
            script.type = "text/javascript";
            script.defer = true;
            script.src = s.url;

            script.onerror = script.onload = script.onreadystatechange = function( e ) {
                transports.script.callback( e, script, s );
            };

            head.appendChild( script );
        },

        callback: function( event, script, s ) {
            if ( !script.readyState || /loaded|complete/.test( script.readyState ) || event === "error" ) {
                script.onerror = script.onload = script.onreadystatechange = null;
                kss.remove( script );

                if ( s.type === "script" || event !== "error" ) {
                    s.success.call( s.context );
                }
            }
        }
    }
};

// 动画
kss.extend({
    // 入队(update at 2013.03.27)
    queue: function( elem, name, fn ) {
        var queue = kss.data( elem, "queue", name, [] );
        if ( !kss.isFunction( fn ) ) {
            fn = returnFalse;
        }
        queue.push( fn );
    },
    // 出队并执行(update at 2013.03.27)
    dequeue: function( elem, name ) {
        var fn,
            queue = kss.data( elem, "queue", name );
        if ( queue ) {
            fn = queue.shift();
            fn.call( elem );
        }
        if ( !queue[0] ) {
            kss.removeData( elem, "queue", name );
        }
    },
    // 动画方程 from jQuery(add at 2012.11.25)
    easing: {
        linear: function( p ) {
            return p;
        },
        swing: function( p ) {
            return 0.5 - Math.cos( p * Math.PI ) / 2;
        }
    }
});

kss.fn.extend({
    // 动画效果(update at 2013.03.27)
    animate: function( prop, speed, easing, callback ) {
        var options;
        if ( kss.isFunction( easing ) ) {
            callback = easing;
            easing = "swing";
        }

        options = {
            speed : parseInt( speed ),
            easing : easing || "swing",
            callback: callback || returnFalse
        };

        return kss.each(this, function() {
            var key, fx, from, to;
            kss.queue( this, "animate", options.callback );

            for ( key in prop ) {
                if ( kss.inArray( key, fxStyleAttr ) >= 0 ) {
                    fx = new kss.fx( this, options, key );
                    from = parseInt( kss(this).css( key ) );
                    to = parseInt( prop[key] );
                    fx.start( from, to );
                }
            }
        });
    },
    // 停止所有动画(update at 2013.03.27)
    stop: function() {
        return kss.each( this, function() {
            var i = timers.length - 1;
            for ( ; i >= 0; i-- ) {
                if ( timers[ i ].elem === this ) {
                    timers[ i ].stop();
                }
            }
        });
    }
});

var timers = [],
    timerId = null,
    fxStyleAttr = ["lineHeight", "height", "width", "top", "bottom", "left", "right", "backgroundPositionX", "backgroundPositionY", "marginTop", "marginBottom", "marginLeft", "marginLeft", "paddingTop", "paddingBottom", "paddingLeft", "paddingRight"];

// 动画模块(update at 2013.03.27)
kss.fx = function( elem, options, name ) {
    this.elem = elem;
    this.options = options;
    this.name = name;
};

kss.fx.prototype = {
    start: function( from, to ) {
        this.start = kss.now();
        this.end = this.start + this.options.speed;
        this.from = from;
        this.to = to;
        
        timers.push( this );
        kss.fx.tick();
    },

    step: function( t ) {
        var p,
            pos;
        if ( t >= this.end ) {
            pos = this.to;
            this.stop();
            kss.dequeue( this.elem, "animate" );
        } else {
            p = kss.easing[ this.options.easing ]( (t - this.start) / this.options.speed );
            pos = this.from + ( (this.to - this.from) * p );
        }
        this.update( pos );
    },

    update: function( value ) {
        this.elem.style[ this.name ] = value + "px";
    },

    stop: function() {
        var i = timers.length - 1;
        for ( ; i >= 0; i-- ) {
            if ( timers[ i ] === this ) {
                timers.splice( i, 1 );
                break;
            }
        }
    }
};

kss.fx = {
    tick: function() {
        var i = 0,
            fxNow = kss.now();
        for ( ; i < timers.length; i++ ) {
            timers[ i ].step( fxNow );
        }
        if ( timers.length === 0 ) {
            kss.fx.stop();
        }
        fxNow = undefined;
    },

    start: function() {
        if( !timerId ) {
            timerId = setInterval( kss.fx.tick, 13 );
        }
    },

    stop: function() {
        clearInterval( timerId );
        timerId = null;
    }
};

// 扩展接口
kss.extend({
    // 获取URL参数(update at 2013.03.25)
    queryString: function(name) {
        var i = 0,
            params = {},
            key,
            value,
            pos,
            search = location.search ? location.search.substr( 1 ).split("&") : [];
        
        for ( ; i < search.length; i++ ) {
            pos = search[ i ].indexOf("=");
            if ( pos > 0 ) {
                key = search[ i ].substring( 0, pos );
                value = search[ i ].substring( pos + 1 );
                params[ key ] = decodeURIComponent( value );
            }
        }
        if ( typeof name === "undefined" ) {
            return kss.isEmptyObject( params ) ? undefined : params;
        }
        return params[ name ] ? params[ name ] : undefined;
    },

    // cookie操作(update at 2013.03.25)
    cookie: function(name, value, options) {
        var i = 0,
            len,
            cookies,
            cookie,
            ret,
            expires = "",
            date,
            path,
            secure;

        if ( name == null ) {
            return null;
        }
        // 读取cookie
        if ( typeof value === "undefined" ) {
            if ( document.cookie && document.cookie != "" ) {
                cookies = document.cookie.split(";");
                for ( len = cookies.length; i < len; i++ ) {
                    cookie = kss.trim( cookies[ i ] );
                    if ( cookie.indexOf( name + "=" ) === 0 ) {
                        ret = cookie.substr( name.length + 1 );
                        break;
                    }
                }
            }
            return ret;
        }
        // 设置cookie
        options = options || {};
        // 删除cookie
        if ( value === null ) {
            value = "";
            options.expires = -1;
        }

        if ( options.expires && ( typeof options.expires == "number" || options.expires.toUTCString ) ) {
            if ( typeof options.expires == "number" ) {
                date = new Date();
                date.setTime( date.getTime() + options.expires * 1000 );
            } else {
                date = options.expires;
            }
            expires = "; expires=" + date.toUTCString();
        }

        path = options.path ? "; path=" + options.path : "";
        domain = options.domain ? "; domain=" + options.domain : "";
        secure = options.secure ? "; secure" : "";
        ret = [ name, "=", encodeURIComponent( value ), expires, path, domain, secure ].join("");
        document.cookie = ret;
        return ret;
    }
});

// 浏览器检测(update at 2012.11.23)
var clientMatch = function() {
    var ua = navigator.userAgent.toLowerCase(),
        match;

    browser = {
        ie: false,
        firefox: false,
        chrome: false,
        webkit: false,
        safari: false,
        opera: false,

        version : ""
    };
    // Opera通过特有属性判断
    if ( window.opera ) {
        browser.version = window.opera.version();
        browser.opera = true;
        // 其他通过userAgent检测
    } else {
        match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
            /(webkit)[ \/]([\w.]+)/.exec(ua) ||
            /ms(ie)\s([\w.]+)/.exec(ua) ||
            /(firefox)[ \/]([\w.]+)/.exec(ua) ||
            [];

        if ( match[1] ) {
            browser[ match[1] ] = true;
        }
        browser.version = match[2] || "";
        // 在PC端，webkit浏览器不是Chrome/Chromium就是Safari
        if ( browser.webkit ) {
            browser.safari = true;
            match = /version\/([\w.]+)/.exec( ua );
            browser.version = match[1] || "0";
        }
        if ( browser.chrome ) {
            browser.webkit = true;
        }
    }
    return browser;
};
kss.browser = clientMatch();

rootKss = kss( document );
window.kss = window.$ = kss;

})(window);