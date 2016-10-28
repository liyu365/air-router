window.airRouter = (function () {
    var instance;

    function Singleton() {
        if (instance) {
            return instance;
        } else {
            if (!(this instanceof Singleton)) {
                return new Singleton();
            }
        }

        this.routes = {};
        this.defaultHash = null;

        this.when = function (route, callback) {
            this.routes[route] = {
                route: route,
                callback: callback,
                regexp: this.packageRegexp(route)
            };
            return this;
        };

        this.otherwise = function (hash) {
            this.defaultHash = hash;
            return this;
        };

        this.trigger = function (hash) {
            var routes = this.routes;
            for (var route in routes) {
                if (routes[route].regexp.test(hash)) {
                    var callback = routes[route].callback || function () {
                        };
                    var params = this.getParams(routes[route].regexp, hash);
                    callback.apply(routes[route], params);
                    return;
                }
            }
            if (hash === this.defaultHash) {
                throw Error('otherwise()方法中传入的hash没有定义对应的路由');
            }
            if (typeof this.defaultHash === 'string') {
                location.hash = '#' + this.defaultHash;
                this.trigger(this.defaultHash);
            }
        };

        this.start = function () {
            var _this = this;
            var hash = location.hash.slice(1);
            _this.trigger(hash);
            var oldHash = location.hash;
            if ("onhashchange" in window.document.body) {
                window.addEventListener('hashchange', function () {
                    _this.trigger(location.hash.slice(1));
                });
            } else {
                setInterval(function () {
                    if (oldHash != location.hash) {
                        oldHash = location.hash;
                        _this.trigger(location.hash.slice(1));
                    }
                }, 100);
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
                .replace(/\((.*?)\)/g, '(?:$1)?')
                .replace(/\/(\w*):\w+/g, '\/$1([^/]+)')
                .replace(/\*.*/, '([^?]*).*');
            return new RegExp('^' + route + '$');
        };

        this.getParams = function (reg, hash) {
            return reg.exec(hash).slice(1);
        };

        instance = this;
    }

    return Singleton;
})();