#air-router

提供最直接的前端路由功能，采用监听hashChange的原理进行编写，兼容低版本浏览器(IE6+)，支持基本的匹配规则。
采用单例模式编写，可以在代码任意位置调用`airRouter()`配置路由。
一切路由匹配规则均忽略`?`以后的查询字符串。

匹配规则：

* 形如`/:id/`的字符串表示捕获`:id`的值，其值会作为回调函数的参数，按顺序传入
* `()`内的值可有可无，但是内部依然可以进行捕获
* `*`后面的所有字符都视为通配
* `otherwise()`方法用于设置默认hash

示例[(演示地址)](https://liyu365.github.io/air-router/demo)：

```
var router = airRouter();
router.when('/', function () {
    
}).when('/news/', function () {
    
}).when('/news/:category/:id', function (category, id) {
    
}).when('/order/*', function (starString) {
    
}).otherwise('/').start();
```

另外，可以通过配置项`useHistoryState`开启popState事件的路由，例如：

```
var router = airRouter({
    useHistoryState: true,     //开启popState事件的监听
    links: document.querySelectorAll('a[href]'),   //需要进行pushState的按钮
    baseURL: ''  //单页页面本身的真实url
});
```