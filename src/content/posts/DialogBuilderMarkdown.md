---
title: DialogBuilder
published: 2025-08-26
description: DialogBuilder
tags:
  - 技术
  - 思考
category: MoonLight
draft: false
---
### 重构了很多弹窗，做了很多优化，封装了很多冗余的布局
感谢AI，帮我写出如此美丽的代码，让我自己修了如此多的bug

 1.  DialogBuilder 英文名起的我很满意正宗伦敦腔，不解释了
 2. buildHorizontalLayout 横着的布局
 其他我不想解释，似乎英文名已经告诉清楚了，你问AI把 

关于那个按钮
原包那里有个参数boolean `compactLayout` ，这个似乎不太智能，与其重看他怎么构造的，我还不如自己玩自定义，所以-------》

```Java
setLastButtonFixedWidth(rootLayout, activity, 210);
```

这里的210，就是按钮宽度，自己根据喜好走

给出相关调用方式

```Java
LiConfiguration.addButtonStyle2(rootLayout, activity, negativeButtonText, v -> {  
    negativeListener.onClick();  
    LiConfiguration.animateDialogDismiss(customDialog);  
}, false); // 将 false 改为 true，使按钮宽度与父布局匹配  
setLastButtonFixedWidth(rootLayout, activity, 210);
```
#### 然后就是如何适配Markdown

引入依赖包

```Json
implementation("io.noties.markwon:core:4.6.2")
```
具体官方文档我只看了第一行，接下来给出我调用的方式

我在项目当中依旧写在LiUI了，啊，舒服‘
`createDialogContent`
参数之前说了

```Java
* @param activity      Activity实例  
* @param markdownText      markdown文本  
* @param textSizeSp    字号 (单位: sp)  
* @param paddingLeft   左内边距 (单位: px)  
* @param paddingTop    上内边距 (单位: px)  
* @param paddingRight  右内边距 (单位: px)  
* @param paddingBottom 下内边距 (单位: px)
```

弹窗如何用它捏

看这里

```Java


if (content != null) {  
    TextView contentView = LiUI.createDialogContent(activity, this.content, 16f, dp(10), 0, dp(10), 0);  
    contentView.setGravity(Gravity.CENTER);  
    rootLayout.addView(contentView);  
}
```

另说一下那个 依赖库markwon
```Java
// 初始化 Markwon 实例  
final Markwon markwon = Markwon.create(activity); // 使用 Markwon 的工厂方法创建实例
markwon.setMarkdown(textView, markdownText);
然后return textView
```

用之前记得TextView textView = new TextView(activity); 我这里后面补充的，textView看你喜好改