---
title: startInitialization初始化逻辑
published: 2025-07-09
description: startInitialization
tags:
  - 技术
  - 思考
category: moonlight
draft: true
---
startInitialization函数
包含了核心的初始化逻辑，例如加载配置、检查更新、发起网络请求等
参数domesticUrl，internationalUrl，分别为两个配置文档网络路径
关于文档的后台，交给cloud flare connect gist项目编写，之后开源
弱引用防止内存问题https://javaguidepro.com/blog/java-weakreference/
  
