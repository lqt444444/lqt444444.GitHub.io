---
title: Huorong false alarm
published: 2025-09-07
description: false alarm
tags:
  - 技术
  - 思考
  - 安全
category: 随笔
draft: false
---


:::tip
Trojan/Donut.e 通常是一种启发式检测名称。这意味着安全软件并非通过已知的病毒签名来识别威胁，而是通过分析程序的行为模式（例如，在系统临时文件夹中创建和执行文件）来判断其是否可疑。这种检测方式有时会将正常的软件更新行为误判为恶意行为
:::

```
病毒名称：Trojan/Donut.e
病毒ID：626643CE1E428E6D
病毒路径：C:\Windows\SystemTemp\chrome_Unpacker_BeginUnzipping14756_1875877283\UpdaterSetup.exe
操作类型：修改 
操作结果：已处理，删除文件

进程ID：14756
操作进程：C:\Program Files (x86)\Google\GoogleUpdater\141.0.7340.0\updater.exe
操作进程命令行："C:\Program Files (x86)\Google\GoogleUpdater\141.0.7340.0\updater.exe" --system --windows-service --service=update
父进程ID：800
父进程：C:\Windows\System32\services.exe
```

C:\Windows\SystemTemp 是一个合法的Windows系统临时文件夹，通常用于存放应用程序在安装或更新过程中解压的临时文件。当Google Chrome等软件进行更新时，会将安装包解压到这样一个临时目录中执行安装，完成后再将临时文件删除。因此，UpdaterSetup.exe 出现在此路径下是符合正常更新逻辑的

日志中执行操作的进程是 C:\Program Files (x86)\Google\GoogleUpdater\141.0.7340.0\updater.exe。这是一个合法的Google更新程序，负责保持Google Chrome浏览器及其他Google软件的最新状态。近年来，Google已经将原来的 GoogleUpdate.exe 逐渐替换为 updater.exe。

命令行参数 --system --windows-service --service=update 表明该更新程序是作为一个系统服务在后台静默运行的，这是Google更新的正常工作模式，旨在不打扰用户的情况下完成自动更新。

父进程 C:\Windows\System32\services.exe 是Windows操作系统核心的“服务控制管理器”。它的作用是启动、停止和管理系统中的各项服务。Google的更新程序作为一个后台服务，由 services.exe 启动是完全正常的

也因此此次报毒属于误报