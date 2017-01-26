/**
 * @file EHU S端路由
 * @author Homkai Wong(wanghongkai@baidu.com)
 */
var express = require('express');
var path = require('path');
var httpProxy = require('express-http-proxy');
var URL = require('url');
var fs = require('fs');
var request = require('request');

var config = {};
/**
 * 注入的JS
 *
 * @type {string[]}
 */
var INJECT_JS_LIST = ['socket.io.js', 'esl-ehu.js', 'hot-update.js'];

/**
 * 生成路由规则
 *
 * @returns {*[]}
 */
function getRuleList() {
    var list =  [{
        reg: new RegExp('.fasdfasfssa'),
        fn: getIndexHTML
    },{
        reg: /dep\/etpl\/[^\/]*\/src\/main\.js/,
        file: 'etpl/src/main.js'
    },{
        reg: /dep\/fc-component-ria\/[^\/]*\/src\/registry\.js/,
        file: 'fc-component-ria/src/registry.js'
    }];
    return list;
}

/**
 * 修改入口文件，将ESL的位置，注入INJECT_JS_LIST
 *
 * @param req
 * @param res
 */
function getIndexHTML(req, res){
    console.log('getIndexHTML');

    var indexHTML = path.resolve(config.indexDir, config.indexDir + config.indexHTML);
    console.log(indexHTML);
    var content = fs.readFileSync(indexHTML) + '';
    var inject = [];
    INJECT_JS_LIST.forEach(function (item) {
        inject.push( '<script src="/' + item + '"></script>');
         });
    content = content.replace(/<script.*?src=".*\/esl\.js".*?><\/script>/, inject.join(''));
    res.send(content);
}

/**
 * 按规则路由转发
 *
 * @param req
 * @param res
 * @returns {boolean}
 */
function ruleRoute(req, res) {

    var isMatch = false;

    if(req.url.indexOf(".") == -1 && req.url.indexOf("api") == -1 && req.headers.accept.indexOf('text/html') !== -1) {
        console.log(req.url);
        getIndexHTML(req, res);
        isMatch = true;
    }

    // 路由规则
    var ruleList = getRuleList();
    ruleList.forEach(function (item) {
        if (isMatch) {
            return;
        }
        if(item.reg.test(req.url)) {
            if (item.file) {
                // 重定向到public文件夹
                res.redirect('/' + item.file);
            }
            if (item.fn) {
                item.fn(req, res);
            }
            isMatch = true;
        }
    });
    return isMatch;
}



/**
 * 初始化
 *
 * @param app
 * @param conf
 */
exports.init = function(app, conf) {
    config = conf;
    request.get(config.defaultServer+config.module, function(e,r,body){
        console.log('request indexHtml!');
        return body;
    }).pipe(fs.createWriteStream(config.indexDir+config.indexHTML));

    var mid = express();
    mid.all('*', httpProxy(config.defaultServer, {
        // 先走特殊规则，否则就代理到默认web server
        filter: function(req, res) {
            // return false;
            return !ruleRoute(req, res);
        },
        forwardPath: function(req, res) {
            return URL.parse(req.url).path;
        }
    }));
    // 由express-http-proxy托管路由
    app.use('/', mid);
};