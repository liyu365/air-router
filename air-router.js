window.airRouter = (function () {
    var instance;

    function extend(obj1, obj2) {
        for (var k in obj2) {
            obj1[k] = obj2[k];
        }
        return obj1;
    }

    function stopDefaultAction(event) {  //这里的event已经确定是事件对象，不为空了
        if (event.preventDefault) {
            event.preventDefault();  //标准
        } else {
            event.returnValue = false;  //IE6,7,8
        }
    }

    function Singleton(opt) {
        if (instance) {
            return instance;
        } else {
            if (!(this instanceof Singleton)) {
                return new Singleton(opt);
            }
        }

        this.option = {
            useHistoryState: false
        };
        extend(this.option, opt);
        this.routes = {};
        this.defaultPath = null;

        this.when = function (route, callback) {
            this.routes[route] = {
                route: route,
                callback: callback,
                regexp: this.packageRegexp(route)
            };
            console.log(this.packageRegexp(route));
            return this;
        };

        this.otherwise = function (path) {
            this.defaultPath = path;
            return this;
        };

        this.trigger = function (path) {
            var routes = this.routes;
            for (var route in routes) {
                if (routes[route].regexp.test(path)) {
                    var callback = routes[route].callback || function () {
                        };
                    var params = this.getParams(routes[route].regexp, path);
                    callback.apply(routes[route], params);
                    return true;
                }
            }
            if (path === this.defaultPath) {
                throw Error('otherwise()方法中传入的hash没有定义对应的路由');
            }
            if (typeof this.defaultPath === 'string') {
                if (this.option.useHistoryState) {
                } else {
                    location.hash = '#' + this.defaultPath;
                }
                this.trigger(this.defaultPath);
            }
        };

        this.start = function () {
            var _this = this;
            if (_this.option.useHistoryState) {
                if ('pushState' in history) {
                    //todo 根据初始url获取url中的路由path
                    //_this.trigger(_this.getFormattedPath());
                    window.onpopstate = function (event) {
                        if (event.state) {
                            _this.trigger(event.state.path);
                        }
                    };
                    for (var i = 0, len = _this.option.links.length; i < len; i++) {
                        _this.option.links[i].onclick = function (e) {
                            var e = e || window.event;
                            stopDefaultAction(e);
                            var path = this.getAttribute('href');
                            if (path !== null) {
                                if (history.state && history.state.path === path) {
                                    return;
                                }
                                window.history.pushState({path: path}, document.title, path);
                                _this.trigger(path);
                            }
                        }
                    }
                } else {
                    throw Error('此浏览器不支持pushState');
                }
            } else {
                _this.trigger(_this.getFormattedPath());
                var oldHash = location.hash;
                if ("onhashchange" in window.document.body) {
                    window.addEventListener('hashchange', function () {
                        _this.trigger(_this.getFormattedPath());
                    });
                } else {
                    setInterval(function () {
                        if (oldHash != location.hash) {
                            oldHash = location.hash;
                            _this.trigger(_this.getFormattedPath());
                        }
                    }, 100);
                }
            }
        };

        this.getFormattedPath = function () {
            var _this = this;
            if (_this.option.useHistoryState) {
                return location.href.replace(/\?.*/, '');
            } else {
                return location.hash.slice(1).replace(/\?.*/, '');
            }
        };

        /**
         * 第一步：
         * 首先要知道等待被replace的字符串是要生成正则表达式用的
         * 正则表达式中 * . ? + - ^ $ [ ] ( ) { } | \ / 这些字符是有特殊语义的特殊的字符，要想在正则中把它们当做普通的字符可以匹配，就要在前面加转义字符 \
         * 注意 * ( ) 是本路由规则中的特殊字符会被找出并替换为其它形式，所以不要事先在它们的前面加转义字符，否则会造成 * ( ) 的前面有多余字符 \ 影响替换
         *
         * 第二步：
         * 去除字符串中的()，并把()中的内容变成不捕获的子表达式并且可以出现0或1次，也就是()内部的内容可有可无
         *
         * 第三步：
         * 把从 : 开始到非字母数字的字符结束，这之间的字符都进行捕获，并且这些字符中不能再包含字符 /
         *
         * 第四步：
         * 从 * 往后的所有字符变为都可以匹配，但捕获只捕获到 ? 之前为止
         */
        this.packageRegexp = function (route) {
            route = route.replace(/[.?+\-^$\[\]{}|\/]/g, '\\$&')  //注意，正则中表示字符集和的[]中除了 [ ] - 这三个字符，其他的的特殊字符不用在前面加转义字符
                .replace(/\((.*)\)/g, '(?:$1)?')
                .replace(/\/(\w*):\w+/g, '\/$1([^/]+)')
                .replace(/\*.*/, '([^?]*).*');
            return new RegExp('^' + route + '$');
        };

        this.getParams = function (reg, path) {
            return reg.exec(path).slice(1);
        };

        instance = this;
    }

    return Singleton;
})();