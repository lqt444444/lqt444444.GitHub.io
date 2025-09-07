---
title: 如何给应用内置杀en
published: 2025-08-26
description: 如何给应用内置杀en
tags:
  - 技术
  - 思考
  - 教程
category: MoonLight
draft: false
---
1. Mt打开你要添加配置的`AndroidManifest.xml`
2. 找到存在activity的标签
3. 找到你要注入的Activity（优先选择主Activity）
4. 找到`android:name="我是类名`（注意，不同的APP有不同的类名，你只需要找到一个和这个相似的东东，啊然后复制）
5. 接下来需要找到OnCreate这个方法
> 在Java当中，这个是入口方法，你要定位，需要等加载布局之后，加载布局完毕，你再用p0作为参数调用悬浮窗/或者是杀文件，定位代码的标准就是找到setConTentVIew这个方法之后，你把方法签名复制，然后调用传参数p0就可以

:::tip
p0在Java当中就有this的意思，这保证了参数类型的正确性
:::
6. 大功告成，dialog注入同理

调用杀EN相关代码
 之后补充
