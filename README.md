#air-router

提供最直接的前端路由功能，采用监听hash的原理进行编写，兼容低版本浏览器(IE6+)，支持基本的匹配规则。

匹配规则：

* 形如`/:id/`的字符串表示捕获`:id`的值，其值会作为回调函数的参数，按顺序传入
* `()`内的值可有可无，但是内部依然可以进行捕获
* `*`后面的所有字符都视为通配
* `otherwise()`方法用于设置默认hash

示例：

```
var router = airRouter();
router.when('/', function () {
    
}).when('/news/', function () {
    
}).when('/news/:category/:id', function (category, id) {
    
}).when('/order/*', function (starString) {
    
}).otherwise('/').start();
```