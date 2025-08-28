---
title: 补充网络配置加载
published: 2025-08-27
description: 补充网络配置加载
tags:
  - 技术
  - 思考
  - 教程
category: MoonLight
draft: false
---
续上文 ----> [[如何给应用内置杀en]]


之前说的略微有一些纰漏，今日三思后决定补充图文

![图片，看不到请翻墙](https://image.342191.xyz/file/AgACAgUAAyEGAASrPZpLAAMPaK7DCG4I8OPWFx_70CCIcPF9iMYAAkbJMRv4-HlVsVdWmNgtHg4BAAMCAAN4AAM2BA.png)

我这里随机找了一个安装包，为了避免不必要误导，无关信息已经打码

![图片，看不到请翻墙](https://image.342191.xyz/file/AgACAgUAAyEGAASrPZpLAAMQaK7Dn7CoWT0PLS7gv3rKXy5j7DEAAknJMRv4-HlVQw6mXGToh64BAAMCAANtAAM2BA.png)

观察Activity的标签，出现MAIN，这可以判断为主Activity

![图片，看不到请翻墙](https://image.342191.xyz/file/AgACAgUAAyEGAASrPZpLAAMSaK7FbxBJ7Jyeb5FgIpnJDt7282cAAk7JMRv4-HlVWnLxw1j58mQBAAMCAAN4AAM2BA.png)
相关类名复制下来


![图片，看不到请翻墙](https://image.342191.xyz/file/AgACAgUAAyEGAASrPZpLAAMTaK7FembvXfhPWL1csQ2bQTU8aIMAAk_JMRv4-HlVcnY80B7tQBIBAAMCAAN4AAM2BA.png)

进入DEX编辑器，全选，然后复制类名
![图片，看不到请翻墙](https://image.342191.xyz/file/AgACAgUAAyEGAASrPZpLAAMUaK7FgtGoEv8JifMMRQeSkHBzcAgAAlDJMRv4-HlV3TqjX3Fh9dIBAAMCAAN4AAM2BA.png)

点击搜索
![图片，看不到请翻墙](https://image.342191.xyz/file/AgACAgUAAyEGAASrPZpLAAMVaK7FjCYnfV6VmwUiO9S5cIXa2GcAAlHJMRv4-HlVN7A1fnS3zt4BAAMCAAN4AAM2BA.png)

导航到入口
![图片，看不到请翻墙](https://image.342191.xyz/file/AgACAgUAAyEGAASrPZpLAAMWaK7FmhwWz7gGIexnUl-9aWg6ARsAAlLJMRv4-HlVNOwFkXYYs2cBAAMCAAN4AAM2BA.png)



找到SetContentView，在下方注入代码，一般情况下，this的参数就是当前Activity的实例，也就是p0
![图片，看不到请翻墙](https://image.342191.xyz/file/AgACAgUAAyEGAASrPZpLAAMXaK7Fow3mLo9KONVvmiXV2IkAAYRcAAJTyTEb-Ph5VRDAyfuBGtLEAQADAgADeAADNgQ.png)


MoonLight项目，调用不同的类，可以实现不同的弹窗样式与功能，之后会补充
