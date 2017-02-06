/**
 * @file EHU B端核心文件
 * @author Homkai Wong(wanghongkai@baidu.com)
 */

/**
 * document ready
 *
 * @param callback
 */
function docReady(callback){
    var readyRE = /complete|loaded|interactive/;
    readyRE.test(document.readyState) && document.body ? callback()
        : document.addEventListener('DOMContentLoaded', callback, false);
}

docReady(function () {
    /**
     * 配置文件
     *
     * @type {{styleTypeList: string[], tplTypeList: string[], componentType: string, updateLimit: number,
      * etpl: {isOverride: boolean}, component: {isOverride: boolean}}}
     */
    var options = window.EHU_HOT_UPDATE_OPTIONS = {
        styleTypeList: ['css', 'less'],
        tplTypeList: ['tpl.html'],
        componentType: 'fc-component-ria/component',
        updateLimit: 100,
        etpl: {
            isOverride: true
        },
        component: {
            isOverride: true
        }
    };

    var socket = io('http://127.0.0.1:8844');

    function log() {
        if(!window.console) return;
        return console.log.apply(console, arguments);
    }

    /**
     * 判断资源类型
     *
     * @param moduleId
     * @param cmp
     * @returns {*|boolean}
     */
    function isRes(moduleId, cmp) {
        !Array.isArray(cmp) && (cmp = [cmp]);
        for(var i in cmp) {
            if (moduleId.indexOf(cmp[i]) > -1) {
                return true;
            }
        }
    }

    function replaceStyle(moduleId, cb) {
        var links = document.getElementsByTagName("link");
        for (var i in links) {
            var link = links[i];
            var reg = new RegExp(moduleId);

            if(link.rel === "stylesheet" && reg.test(link.href)){
                console.log("finish：", link);
                link.href = moduleId+"?version=" + Date.parse(new Date());
                return;
            }
        }
    }

    /**
     * 热更新实现方法
     *
     * @param moduleId
     * @param round
     * @param cb
     * @returns {*}
     */
    function hotUpdate(moduleId, round, cb) {
        log(moduleId);
        var host = [];
        round = round || 0;
        // 判断module是否加载
        if (!moduleId || !window.EHU_MOD_MODULES[moduleId]) {
            return false;
        }
        // 删除ESL缓存
        delete window.EHU_MOD_MODULES[moduleId];
        delete window.EHU_LOADING_MODULES[moduleId];
        window.EHU_REQUIRED_CACHE.forEach(function (item, index) {
            item[moduleId] && (delete window.EHU_REQUIRED_CACHE[index][moduleId]);
        });
        // 递归删除ESL依赖宿主缓存
        round--;
        if (round > -1 && window.EHU_DEP_MODULES[moduleId]) {
            window.EHU_DEP_MODULES[moduleId].forEach(function (item) {
                host.push(item);
                var ret = hotUpdate(item, round, cb);
                ret && (host = host.concat(ret));
            });
        }
        // 重新加载最外层宿主module
        else {
            window.require([moduleId], cb);
        }
        return host;
    }

    /**
     * 日志信息统一前缀
     *
     * @returns {string}
     */
    function getLogMsgPrefix() {
        return '[EHU] ' + (new Date()).toLocaleString() + ' ';
    }

    function getQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    }

    function init() {
        // 建立连接
        socket.on('hello', function () {
            log(getLogMsgPrefix(), 'HotUpdate已启动！');
        });
        // 检测到文件改动
        socket.on('hotUpdate', function (file) {
            log(getLogMsgPrefix(), '检测到文件改动', file);
            if(/\.less$/.test(file)){
                log('这是个less文件, 正在更新');
                replaceStyle('src/biz.less');
                return;
            }
            var moduleId = window.EHU_URL_MODULE_ID_MAP[file];
            if (!moduleId) {
                console.log('no', file);
                return;
            }
            var updateLimit = options.updateLimit;
            log(updateLimit);


            var cb = function () {
                if(getQueryString('config')==='true'){
                    var moduleId = location.href.match(/\/([a-zA-Z]{2,10})\//)[1];
                    console.log(moduleId);
                    window.require([moduleId+'/startup'],function(module){
                        module.start();
                        window.require(['er/locator'],function(locator){
                            locator.reload();
                        });
                    });
                } else {
                    window.require(['er/locator'],function(locator){
                        locator.reload();
                    });
                }
            };
            log(moduleId);
            // 样式
            if (isRes(moduleId, options.styleTypeList)) {
                updateLimit = 0;
            }
            // 模板
            if (isRes(moduleId, options.tplTypeList)) {
                updateLimit = 1;
                // options.etpl.isOverride = true;
                // log
                // cb = function () {
                //     log('22');
                //     options.etpl.isOverride = false;
                // };
            }
            // Component
            if (isRes(moduleId, options.componentType)) {
                updateLimit = 1;
                // options.component.isOverride = true;
                // cb = function () {
                //     options.component.isOverride = false;
                // };
            }
            var msg = '';

            var ret = hotUpdate(moduleId, updateLimit, cb);
            if (ret) {
                msg = [
                    getLogMsgPrefix(),
                    '检测到ESL Module改动：',
                    '`' + file + '`',
                    ' 已重新加载该文件及其宿主文件'
                ].join('');
                log(msg, ret);
            }
        });
    }

    init();
});
