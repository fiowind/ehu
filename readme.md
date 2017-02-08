## 针对Console/Osp对应模块的热更新
* 配置ehu.config, 放在tools目录下（举例iot，需要配DNS）

```js
{
    // 默认的web server地址，需用localhost.bcetest.baidu.com
    "defaultServer": "https://localhost.bcetest.baidu.com:8899",
    "defaultServerCLI": "正常启动的bash",
    // 从服务器根目录到需要监控的文件夹中间path
    "baseDir": "../src/iot",
    // hot update 需要watch的文件夹（不包括baseDir）
    "watchDirs": "src",
    // 下面两项默认这么设，不用管
    "indexDir": "../src",
    "indexHTML": "/common/ehu-index.html",
    // 模块
    "module": "/iot",
    // ehu启动端口号（不可与默认的服务器端口号冲突）
    "port": 8844
}
```

例子见代码中的console-ehu.config 和 osp-ehu.config, 建议直接拿来修改模块名即可
## 启动
> cd console或osp的同级目录或你自己喜欢的地方
> 
> git clone https://github.com/fiowind/ehu.git && cd ehu && npm i && cd ../
> 
> cd console/tools && ./server.sh #启动原服务
> 
> node ../../ehu/bin/ehu.js -n  #启动热更新服务，这里的路径根据你自己存放该代码库的路径改变

*上面是各自启动两个服务*

1. chrome://net-internals/#hsts 中将localhost.bcetest.baidu.com删除
2. 访问热更新地址：http://localhost.bcetest.baidu.com:8844/iot/?ed&no_xss&locale=zh-cn#
3. 访问http://localhost.bcetest.baidu.com:8844/iot/?ed&no_xss&locale=zh-cn&config=true，  加上config=true，回去重新startup，config修改也能生效
4. 原 https://localhost.bcetest.baidu.com:port 和原来一样访问，不受esl-hot-update影响

-------
***以下为原说明, 针对其他不明项目***
# EHU(esl-hot-update)

- 与默认的web server完美解耦，可以支持http-server、edp webserver start等原来的启动逻辑
- 对esl模块，做热更新加载，极大方便调试！
- 完美兼容edp、edp-webserver，使用方便
- 全面支持支持MVC、Component、monitor、模板文件、LESS等等

## 快速使用（FCFE同学参考）
* /nirvana-workspace *

> npm install -g ehu（mac下需要sudo，windows下需要管理员权限）

> 在原来执行edp webserver start命令的路径 执行 ehu（不再需要执行 edp webserver start）

> 原来端口号8848修改为8844（原8848依旧可以使用，但不支持热更新）

* /chunhua-workspace及其他项目 参考配置 *


# 高级使用

## 安装

> npm install -g ehu（mac下需要sudo，windows下需要管理员权限）

## 配置

- yourProjectDir/ehu.config（JSON格式）
- 配置参考
```js
    {
        // 默认的web server地址
        "defaultServer": "http://127.0.0.1:8848",
        // 默认的web server启动命令
        "defaultServerCLI": "edp webserver start",
        // 从服务器根目录到需要监控的文件夹中间path
        "baseDir": "nirvana-workspace",
        // hot update 需要watch的文件夹（不包括baseDir）
        "watchDirs": "src",
        // 入口文件（不包括baseDir）
        "indexHTML": "main.html",
        // ehu启动端口号（不可与默认的服务器端口号冲突）
        "port": 8844
    }
```

## 启动

> cd yourProjectDir

> ehu [-p(--port)]

> 访问新的地址 http://127.0.0.1:8844（默认端口号8844）

*特别说明：启动ehu后，原来的服务完全不受影响，如原来是8848端口，现在仍旧可以正常访问。*

### 手动启动默认web server

> cd yourProjectDir

> edp webserver start

> ehu -n(--noServerCLI)

或者先配置defaultServerCLI为""

> ehu

# FAQ

1、web server挂掉如何解决？

- 先按原来的方式启动默认web server，如edp webserver start
- 再在启动web server的路径，重开一个命令行窗口启动ehu，并加参数-n，即ehu -n


