# Kss Javascript Library

这是一个Javascript的小型类库，开始我把他称为框架，后来想了想，称为库比较合适。
这里面的api兼容了jQuery的写法，也借鉴了不少jQuery的设计模式。特点是小，继承了很多常用的方法。
由于Javascript也是刚学习不久，兼容性也达不到jQuery那么强悍的水准。
但是对于我来说，这是一种知识不断积累的过程，意义其学习的意义远大于实际应用。代码都是一些常见的设计思路，没有jQuery的复杂和迂回，适合和我一样刚入门的童鞋参考和学习。

## Api文档

### 基础选择器

* $(selector)/kss(selector)

传入"#id"/".class"/"tag"/elem/function(Ready方法)，支持带空格如".class tag"，不支持伪类，返回kss对象。

* .eq(index)

传入索引值，返回对应的节点的kss对象。

支持传入负值，如：`$("a").eq(-1)`取最末尾节点。

* .find(selector)

返回相应后代节点的kss对象。

* .children([selector])

只在子节点遍历，返回全部或相应子节点的kss对象。

* .parent()

返回父节点的kss对象，已排重。

* .parents([selector])

返回上级节点对应选择器的kss对象，已排重。

* .next()

返回kss对象第一个元素之后第一个兄弟节点。

* .nextAll()

返回kss对象第一个元素之后所有兄弟节点。

* .prev()

返回kss对象第一个元素之前第一个兄弟节点。

* .prevAll()

返回kss对象第一个元素之前所有兄弟节点。

* .siblings()

返回kss对象第一个元素除自身以外所有兄弟节点。

* .append()

在元素里面内容的末尾插入内容。

* .prepend()

在元素里面内容的前面插入内容。

* .before()

在元素之前插入内容。

* .after()

在元素之后插入内容。

### 节点操作

* .each()

遍历kss对象中的节点，进行相应的操作。如：

    $("a").each(function() {
        console.log(this);
    });

* .attr(name[, value])

只传入第一个参数，返回kss对象中第一个节点对应的属性值。

传入两个参数，设置节点的属性值。

注：可能会遇到在某些浏览器下无法设置属性的问题。

* .removeAttr(name)

删除元素相应属性。

* .prop(name[, value])

读取或设置节点的Property属性。

* .removeProp(name)

删除节点的Property属性，如果是原生属性还是少删为妙。

* .val([value])

只传入第一个参数，返回kss对象中第一个表格类节点（input、button等）的value值。

传入两个参数，设置节点的value值。

* .html([string])

不传入参数返回kss对象中第一个节点的html内容。

传入字符串设置节点的html内容，如：`$("div").html("<p>kss</p>")`。

* .text([string])

不传入参数返回kss对象中第一个节点的文本内容。

传入字符串设置节点的文本内容，如：`$("h1").html("kss")`。

注：由于现代浏览器的textContent和ie的innerText实现结果还是有一点点区别，所以。

* .data(name[, value])

对应元素读取或写入缓存数据。

* .removeData(name)

对应元素删除缓存数据。

* .remove()

删除相应节点。

### 样式操作

* .hasClass(name)

判断元素是否存储对应class。

注：只有元素集里面有一个有相应的class，就返回true;

* .addClass(name)

添加class。

* .removeClass(name)

删除class。

*.css(name[, value])

只传入第一个参数，返回kss对象中第一个节点对应样式的值。

传入两个参数，设置节点相应样式的值。

注：返回的结果已经过处理，长度类型统一返回px，opacity属性暂未做兼容处理。

* .show()

显示节点，不支持动画。

* .hide()

隐藏节点，不支持动画。

### 事件绑定

* .on(type[, selector, data], fn)

事件绑定。实现bind/live/delegate方法。

bind方法实现：`$("div").on("click", {a:1,b:2}, function(e) {console.log(e.data)});`

delegate方法实现：`$("div").on("click", "a", {a:1,b:2}, function(e) {console.log(e.data)});`

live方法实现：`$(document).on("click", "a", functionA);`

* .off(type[, selector], fn)

事件解绑，实现unbind/die/undelegate方法，不传人函数则解绑响应类型绑定的所有函数。

unbind方法实现：`$("div").off("click", functionA);`

undelegate方法实现：`$("div").on("click", "a");`

die方法实现：`$(document).on("click", "a", functionB);`

* .trigger(type)

触发事件，如click，focus等等（模拟事件触发）

* .click([data, fn])/focus/blur...

简便封装，可绑定可触发。

* .ready()

DOM文档加载完毕执行，不同于onload，不包括加载完图片等。如：

    $(document).ready(function() {
        // Javascript Start
    });

也可以简写：

    $(function() {
        // Javascript Start
    });

### 数据获取

* $.ajax(setting)

异步获取数据。如：

    $.ajax({
        url: "travisup.com",
        type: "POST",
        data: {id:1},
        dataType: "json",
        success: function(data) {
            console.log(data);
        }
    });

* $.getJSON(url[, data, fn])

跨域获取数据。如：

    $.getJSON: function("travisup.com", {id:1}, function(data) {
        console.log(data);
    });
    
* $.getScript(url[, data, fn])

跨域载入Javascript。如：

    $.getScript: function("travisup.com", function() {
        console.log('loaded');
    });
    
### 其他方法

* $.noConflict()

防冲突，释放$的属性，kss的不给。

* $.clone(object)

深度复制对象并返回。

* $.uniq(array)

清除数组内重复数据并返回。

* $.merge(array1, array2)

把第二个数组中数据添加到第一个数组中并返回。

* $.trim(string)

清除字符串中左右的空格并返回。

* $.parseJSON(json)

解析json，兼容ie，必须是一个正确的json对象。

* $.now()

返回当前时间戳。

* $.rand(length)

返回随机数（可指定位数）。

* $.type(obj)

返回传入参数的类型。

* $.isFunction(param)

判断传入的参数是否为函数。

* $.isArray(param)

判断传入的参数是否为数组。

* $.isFunction(param)

判断传入的参数是否为数字（包含只含数字的字符串）。

* $.isScalar(param)

判断传入的参数是否为标量（string/number/boolean）。

* $.isEmptyObject(param)

判断传入的参数是否为空对象，没判断继承的属性。

## Extend 扩展Api

* .animate(prop, speed[, easing, callback])

实现渐变的动画效果。如: 

    $("div").animate({top: 100, left: 100}, 200, "swing", function() {
        console.log("end")
    });

注：使用回调函数可能会遇到bug，队列理解的不够深奥，不建议使用。

* $.browser

判断浏览器模式，支持ie/chrome/safari/firefox/opera。

如在ie9浏览器标准模式下：

    $.browser = {
        ie: true,
        firefox: false,
        safari: false,
        opera: false,
        chrome: false,
        gecko: false,
        webkit: false,
        version: "9.0"
    }

注：由于现在的浏览器存在userAgent欺骗的情况，所以不建议使用。

* $.cookie(name[, value, options])

cookie的读取与设置，具体使用方法可见[Cookie](https://github.com/godxiaoji/cookie)

* $.queryString(name)

获取URL对应参数的值。

如：travisup.com?id=1
    
    $.queryString(id) // 返回1

* 支持amd和cmd