---
title: MoonLight后台管理
published: 2025-08-28
description: MoonLight后台管理 基于gist的一个网络弹窗系统
tags:
  - 技术
  - 思考
  - 安卓
category: MoonLight
draft: false
---
项目地址[点我](https://github.com/lqt444444/MoonLight)

::github{repo="lqt444444/MoonLight"}

配置：

```
name = "gist-config-manager"
main = "index.js"
compatibility_date = "2023-11-21" # 使用一个近期的日期

[vars]
GIST_ID = "939fa18978f54f16dcf257ef0e80f7f4"// 根据你生成的链接填
FILENAME = "gistfile1.txt"
```

搭建教程

1. **确认 wrangler.toml 文件
    
2. **再次运行配置安全凭证的命令**（如果之前没有成功运行的话，如果成功了可以跳过）：
    
    codeBash
    
    ```
    # 设置您的新 GitHub 令牌
    wrangler secret put GITHUB_TOKEN
    
    # 设置您的后台管理密码
    wrangler secret put ADMIN_PASSWORD
    ```
    
3. **重新部署**:
    
    codeBash
    
    ```
    wrangler deploy
    ```


 如何用在项目当中使用捏？


请看截图

![图片，看不到请翻墙](https://image.342191.xyz/file/AgACAgUAAyEGAASrPZpLAAMeaLAzEHpLU_nM0Je-o5ro-lfTHGoAAmPJMRtPWYBV7EPorvpMHo8BAAMCAAN3AAM2BA.png)

domesticConfigUrl是国内订阅链接

internationalConfigUrl是国际订阅链接

我们仅仅展示使用GitHubgist搭建的，因此两个链接都用gist一个就好

![图片，看不到请翻墙](https://image.342191.xyz/file/AgACAgUAAyEGAASrPZpLAAMfaLA0GxgZS07f7nrdRdN8t5TP-p0AAmjJMRtPWYBVesJ6M6cWkYcBAAMCAAN4AAM2BA.png)
之后创建好你的链接

进入设置，选好你的token令牌输入
即可完成

![图片，看不到请翻墙](https://image.342191.xyz/file/AgACAgUAAyEGAASrPZpLAAMgaLA0mGzRyu91WFMzr4ThhzvBRLEAAoXJMRtPWYBVVt_xNL8Er-ABAAMCAAN5AAM2BA.png)

token在这里找![图片，看不到请翻墙](https://image.342191.xyz/file/AgACAgUAAyEGAASrPZpLAAMhaLA1B2xHacXDhB8vWHUoafnBZkEAAonJMRtPWYBV_sKF-NjQhlkBAAMCAAN3AAM2BA.png)