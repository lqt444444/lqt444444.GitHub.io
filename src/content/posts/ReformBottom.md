---
title: 对于原项目Dialog的重构
published: 2025-08-23
description: 对于原项目Dialog的重构
tags:
  - 技术
  - 思考
category: MoonLight
draft: false
---
### 引言
这一篇文章，是对于前几日拿到的MoonLight项目的重构
我在这几日实现了如下修改
1. 在入口函数设置为云注入Mainactivity2，之后再跳转MoonLight原始的Activity,这里使用了开源代码，用于对接云注入卡密验证流程，在做安全防护的时候，关键要加密的函数是，`showRegisterDialog(activity, register, appId);`---->这个是用于卡密验证的窗口，其中appid为你生成云注入软件的Id，你可以用MT管理器，搜索到这个字符常量之后，替换到`public static final String DEFAULT_APP_ID =`，原版云注入并没有混淆，直接搜索关键词即可
2. 我在调试环境之下，设置了大批量的log，用于Ai或者我分析，如果编译过程当中，正式发布记得要删掉，否则免得别人逆向过程当中出现奇奇怪怪的字符，让人见笑
3. 原项目由于使用原作者milkmeow使用Ai进行开发，对于按钮的适配十分冗余，我重新进行了封装，但是某些功能会有缩减，这里我附上此次开发具体修改步骤
### 正式教程
#### showDeveloperDialogOptions
这是一个开发者面板，写在了DashboardFragment.java，其中有八个Case，通过修改其中的逻辑，可以调用指定方法，这是用于调试的
#### 关于如何添加弹窗
我这里直接给出调用方法以及代码快，可以便于理解
```Java
/* DashboardFragment.java */
/**  
 * Displays a custom popup dialog. * LiQiuTing注： 如何便捷调用本主题弹窗，请参考bbs.yuchen.icu.ui.dashboard.DashboardFragment.showDeveloperDialogOptions  
 * @param activity 传入当前的activity  
 * @param title 你弹窗的标题  
 * @param content 正文部分，由于弹窗大小原版是自适应，所以建议写好长一点，不然布局会混乱  
 * @param positiveButtonText 按钮的文字  
 * @param positiveListener 按钮的监听  
 * @param negativeButtonText 第二个按钮  
 * @param negativeListener 第二个按钮的监听  
 *  case 0:  
 *     final Context context = getContext(); *     if (context instanceof Activity) { *         UIUtils.showMyCustomPopup( *                 (Activity) context, // 参数1: Activity  
 *                 "弹窗标题",         // 参数2: String  
 *                 "弹窗内容",         // 参数3: String  
 *                 "第一个按钮文本",     // 参数4: String  
 *                 // 参数5: 第一个按钮的所有点击逻辑都放在这一个 Lambda 表达式里  
 *                 () -> {  
 *                     // 你可以像在普通方法里一样，在这里写多行代码  
 *                     Log.d("Test", "第一个按钮被点击了");  
 *                     Toast.makeText(context, "操作已确认！", Toast.LENGTH_SHORT).show();  
 *                     // 如果还有其他操作，继续在这里添加...  
 *                 }, *                 // 参数 6: 第二个按钮的文本 (String)  
 *                 "取消",  
 *                 // 参数 7: 第二个按钮的点击逻辑  
 *                 () -> {  
 *                     Log.d("MyApp", "用户点击了取消按钮。");  
 *                 } *         ); *     } *     break; * 最多可以增加两个，后面的没写，若不想要第二个按钮，只需要把参数设置为null，  
 */
```
实际上很简单，分别就是七个参数，如果你不想显示多余按钮，只需要让参数设置为null就可以，调用的弹窗逻辑也十分简单明了，你只需要看UIUtils.showMyCustomPopup就可，如果你还需要增加按钮，调用原MoonLight代码的按钮添加逻辑即可

```Java
if (positiveButtonText != null && positiveListener != null) {  
    MaoMaoShiYiGeXiaoSaoHuo.addButtonStyle2(rootLayout, activity, positiveButtonText, v -> {  
        positiveListener.onClick();  
        MaoMaoShiYiGeXiaoSaoHuo.animateDialogDismiss(customDialog);  
    }, false);  
}
```
#### 关于如何添加网络弹窗
实际上也很简单，我同样做了封装，不需要太多行代码，只需要传入指定参数就可以

相关内部自定义常量，在相同的Java文件之下
```
DEFAULT_CONFIG_URL
```
只需要修改他，你就可以自定义相关配置了

调用
```Java

if (getActivity() != null) {  
    UIUtils.showDefaultNetworkDialog(getActivity());  
}
```
如果你想要自定义网络配置，那么

```
showDialogFromUrl(activity, DEFAULT_CONFIG_URL);
```
这里的`DEFAULT_CONFIG_URL`设置为你的网络配置，很简单吧

##### 关于网络配置之下的按钮动作
按钮点击监听，我只写了两个方法，对于他的自定义，我写在了executeActions，顾名思义对吧
1. show_toast，用于视觉上看看成功了没，仅仅是一个toast
2. log，打个log，用来开发调试
3. 写一个自动跳转网页啥的，我感觉也不费事，你自己看着办，对于网页的读取类，NetworkUtils.java，
嗯，别的我没写，实际上我觉得应该写一个方法，把它封装起来，自动扫描应用存储之下所有文件，然后用正则表达式每几分钟扫描一次，也就是杀EN,不过目前还没写，不用管他
 网络配置的书写方式也是这样子的


#### 按钮配置方式

```HTML
〈自定义弹窗标题〉我的自定测试〈/自定义弹窗标题〉
〈自定义弹窗内容〉这是一个从网络加载的内容，包含动态信息。〈/自定义弹窗内容〉
〈按钮1文本〉确认〈/按钮1文本〉
〈按钮1动作〉show_toast:操作已确认！;log:按钮1被点击〈/按钮1动作〉  // 支持多个动作，用;分隔
〈按钮2文本〉取消〈/按钮2文本〉
〈按钮2动作〉close_dialog;log:用户取消了〈/按钮2动作〉
```

对于网页读取方法--->`bbs.yuchen.icu.DialogConfigParserLi#extractValue
之后判断并且创建z相应常量存入---->`bbs.yuchen.icu.DialogConfigParserLi#parse`


好了，先写到这里了