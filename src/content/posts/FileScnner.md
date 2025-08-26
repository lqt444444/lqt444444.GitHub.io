---
title: FileScnner
published: 2025-08-24
description: 对于AndroidAPP私有目录定期并扫描的封装
tags:
  - 技术
  - 思考
category: MoonLight
draft: true
---
:::tip
这是一个定期扫描安卓私有目录文件的，使用时候需要有一定**jvav**基础，不会的可以找张浩洋老师学习，**我在中间会穿插一些教程作为解释，请放心阅读**
:::

### 引言

这个Java的一个封装类，可以让代码便于调用，同时不和外界产生冲突，我的目的很简单，就是提高复用性与可维护性，这里给出调用方法

本项目包分为：
1. FileScanner // 专门对于文件扫描并且查杀的一个类
2. ScannerManager.java // 根据从网络获取的正则表达式，更新并管理扫描器
3. PeriodicFileScanner.java// 周期性的文件扫描与删除
 
 我开发时候喜欢把某些随处调用的方法封装起来，方便统一管理与调用，这需要投入人力，某些AI似乎并不擅长连续化，持久化的开发，即使是Android Studio这几日有一个Agent，也仅仅擅长于一些Error的修复，在这里写好也方便后人了解开发过程，避免屎山代码


### FileScanner

根据给定的正则表达式，异步执行扫描和删除操作。

分别有三个参数
主要起作用的是这两个：
1. regexString 由分号分隔的正则表达式字符串。
2. listener    用于接收扫描结果的回调。

原理：创建一个单线程的后台执行器，在后台线程中执行扫描和清理操作，而后获取应用程序的内部文件目录作为目标扫描目录，并且listener回调扫描完成的信息，并传递已删除文件的列表，其中回调还用于检查正则表达式是否错误之类的，最后递归扫描目录，匹配并删除文件，这个有缺陷，不能循环扫描，后来上网配合Ai写了一个，这是下面这个

他运行起来长这样，啊这个是log，调试用的，生产环境一定要删掉，对吧，不然逆向小子看到了一堆调试环境才有的东西，直接乐死了

```bash
2025-08-26 10:55:40.776 12519-12519 PeriodicFileScanner     bbs.yuchen.icu                       I  启动文件扫描器，执行间隔: 30 秒。
2025-08-26 10:55:40.780 12519-4083  PeriodicFileScanner     bbs.yuchen.icu                       D  开始执行周期性文件扫描...
2025-08-26 10:55:40.785 12519-4083  PeriodicFileScanner     bbs.yuchen.icu                       I  文件匹配成功，准备删除: /data/user/0/bbs.yuchen.icu/files/profileInstalled
2025-08-26 10:55:40.787 12519-4083  PeriodicFileScanner     bbs.yuchen.icu                       I  文件匹配成功，准备删除: /data/user/0/bbs.yuchen.icu/cache/data/user/0/bbs.yuchen.icu/no_backup/androidx.work.workdb.lck
2025-08-26 10:55:40.788 12519-4083  PeriodicFileScanner     bbs.yuchen.icu                       I  文件匹配成功，准备删除: /data/user/0/bbs.yuchen.icu/cache/image_manager_disk_cache/journal
2025-08-26 10:55:40.789 12519-4083  PeriodicFileScanner     bbs.yuchen.icu                       I  文件匹配成功，准备删除: /data/user/0/bbs.yuchen.icu/cache/image_manager_disk_cache/9a8dd13b69d3f91a09330f06e727e47ebc6b0eb9a87d21125eeee5608146f009.0
2025-08-26 10:55:40.789 12519-4083  PeriodicFileScanner     bbs.yuchen.icu                       I  扫描完成。本次共删除了 4 个文件。
2025-08-26 10:55:40.790 12519-12519 PeriodicFileScanner     bbs.yuchen.icu                       D  下一次扫描已安排在 30 秒后。
```

这就是，我把他装在UIUtils.applyRemoteConfig(activity);了，避免使用者不明白参数
当然Activity这个在所难免，用之前实例化一下就好，记得检查一下是否为空，不然出错了不好找

```Java
Activity activity = getActivity();  
  
if (activity != null && !activity.isFinishing()) {  
    // 在确认安全后，再进行调用  
    UIUtils.applyRemoteConfig(activity);  
} else {  
    // (可选) 如果 Activity 不可用，可以记录一个日志或进行其他处理  
    Log.w("DashboardFragment", "无法加载远程配置，因为 Activity 不可用。");  
}
```
### applyRemoteConfig
对DialogConfigParserLi 进行解析，然后调用 ScannerManager 来处理扫描逻辑
ScannerManager就是主角了，说实话你可以直接搬过去用我这个，毕竟代码都摆在那里了

```Java
// 调用 ScannerManager 来处理扫描逻辑  
// 第一个参数 activity.getApplicationContext() 来自 applyRemoteConfig 方法的 activity 参数，  
// 它代表了当前的 Activity，并通过 getApplicationContext() 获取了整个应用的上下文。  
// 第二个参数 config.fileScanRegex 来自 DialogConfigParserLi.parse(networkResponse) 的解析结果，  
// networkResponse 是从 DEFAULT_CONFIG_URL 获取的网络响应字符串。  
ScannerManager.getInstance().manageScanner(activity.getApplicationContext(), config.fileScanRegex);
```

当然我本来是对接网络的，如果你想内置，直接改字符串，不需要从DialogConfigParserLi这里索要fileScanRegex，你要问`config.fileScanRegex`哪来的？？，那就是前文`final DialogConfigLiQiuTing config = DialogConfigParserLi.parse(networkResponse);`解析来的，`networkResponse`是参数，前面需要这样写`String networkResponse = NetworkUtils.fetchContentFromUrl(DEFAULT_CONFIG_URL);`，有啥不会的就看`bbs.yuchen.icu.UIUtilsapplyRemoteConfig`

#### 顺带教学一下

应用程序上下文获取方式
<ul>  
     <li>在 Activity 或 Service 中，可以直接使用 `this` 或 `getApplicationContext()`。</li>  
     <li>在其他类中，可以通过构造函数传递 Context，或者创建一个自定义的 Application 类并在其中提供一个静态方法来获取全局 Context。</li>  
     <li>**重要提示：** 请确保传递的是 Application Context，以避免内存泄漏，尤其是在单例模式下。</li>  
 </ul>
applyRemoteConfig已经给出从其他类获取的方式了
那就是直接getApplicationContext()，直接步步高点读机了

### PeriodicFileScanner

周期性文件扫描
```Java 
/**  
 * 构造函数  
 *  
 * @param context            应用程序上下文  
 * @param initialRegexString 初始的正则表达式  
 * @param intervalSeconds    执行间隔，单位：秒  
 */
```

之后会直接写这里