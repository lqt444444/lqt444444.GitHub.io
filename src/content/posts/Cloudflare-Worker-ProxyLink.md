---
title: Cloudflare-Worker-ProxyLink使用教程
published: 2025-08-11
description: Cloudflare-Worker-ProxyLink一款多功能反向代理工具
tags:
  - 技术
  - 思考
  - 反代
  - Cloudflare
category: 前端
draft: false
---
## 前言
我们在分享网站的时候，难免会出现一些网站无法访问（因为防火墙的存在），而信息的接收方会因为没有特定的代理工具，而无法查看你所分享的信息，但传输可能存在安全性问题，暴露的代理链接又会导致极快的封锁与阻断，因此我开发了Cloudflare-Worker-ProxyLink

## 功能：
- **管理员后台**: 通过密码保护的后台，统一管理所有代理链接。
- **安全的会话管理**: 基于 Cookie 的管理员会话，无需重复登录。
- **链接生成**: 为任意 URL 生成一个安全的、具有随机路径的代理链接。
- **自定义有效期**: 可为每个链接设置独立的有效期（10分钟、1小时、1天、7天或永不过期）。
- **链接密码保护**: 可以为每个生成的代理链接设置独立的访问密码。
- **自定义路径**: 可以为每个生成的代理链接设置独立的访问路径。
- **可以查看**：可以查看访问次数（不准）KV要被艹死了 每天让他艹一千次 所以删了
- **10分钟免密访问**: 终端用户输入一次链接密码后，10分钟内无需再次验证，提升浏览体验。
- **拉跨的反向代理引擎**: HTML重写AI写的十分拉跨，还望看到这个项目的大佬可以帮忙改进
- **链接管理面板**: 在后台清晰地查看所有有效链接的目标、密码、创建和过期时间，并可随时删除。
- **零依赖、易部署**: 单个脚本文件，无需外部服务器或数据库，完全利用 Cloudflare 的全球网络。
## 项目地址
[超链接](https://github.com/lqt444444/Cloudflare-Worker-ProxyLink#%E6%A0%B8%E5%BF%83%E5%8A%9F%E8%83%BD)
或者是这个卡片
::github{repo="lqt444444/Cloudflare-Worker-ProxyLink"}
## 使用方法

### 部署方法
1. 可以把**workers.js**直接复制**到**你创建的workers项目**中，然后进入**workers设置页面
2. 点击**设置**，然后点**变量和机密**，点击**添加**，添加**纯文本**，变量名为：`ADMIN_PASSWORD`，**值**就是你后台**管理员的密码**
3. 返回到你的CF设置页面，添加**KV存储桶**（在**存储与数据库**）
4. 点击KV，`Creat instance`，添加`LINK_STORAGE`
5. 绑定你的cloudflare项目

### 相关函数解释
#### handleRequest将管理逻辑和代理逻辑分开
1. handleRequest决定你跳转到主页的路径，默认是根路径
2. handleRequest同样决定你跳转到admin或者是后台链接生成与管理的路径（生成环境下建议换成相对复杂的，因为我没写防爆破）
3. url.hostname是我们的主机名称 https://${url.hostname}/list-links用于链接后台可视化便捷管理 admin用于后台与登录验证 ，Generate用于创建新的反代链接，每一个链接都是隔离的，不过他们可以任意代理跳转到的网站，logout会给你设置一个过期的cookie，然后让他删除失效
4. handleRequest将管理逻辑和代理逻辑分开，三个判断条件

#### handleAdminRoutes后台管理函数
1. 决定了登出逻辑logout
2. 登录逻辑 (处理POST请求)：登录逻辑下，可以设置回话过期时间，默认十分中

#### handleGenerateLink处理生成链接的逻辑
- 检查路径
- 生成路径，写入KV
- generateRandomString(8)，其中8这个参数，决定你随机生成的路径与密码，可以在这里自定义，源码我已经写好注释了
#### handleListLinks处理显示链接列表的逻辑 link管理
- 列出KV中所有以 "link:" 为前缀的键
- 处理删除链接的逻辑
#### handleProxyRequest
- 别动！！！！ 屎山代码！！！
#### isAdminAuthenticated验证登录

#### generateRandomString生成随机数
- 参数为长度

#### normalizeUrl规范URL

#### UrlRewriterURL读取与重写
- 屎山代码
#### HTML模块
1. renderPag渲染
2. getHomePage页面
3. getAdminLoginPage管理员登录页面
4. adminNav后台导航
5. getLinkGeneratedPage链接生成
6. getLinkListPage管理员管理链接
7. getPasswordPage密码页面，可插入广告用于获利

## 演示网页

1. github镜像站点：
https://mirror.lsm3.dpdns.org/p44ilo/
密码：jiuz9cvf
永久可用
2. 维基百科镜像站点
https://mirror.lsm3.dpdns.org/69jqis/
访问密码：o997uq6c
永久可用
3. libgen镜像站点
https://mirror.lsm3.dpdns.org/sy80p1/
密码：i8gtrpxm