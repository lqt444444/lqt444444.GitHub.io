---
title: 如何注入网络配置弹窗
published: 2025-08-27
description: 给APP注入弹窗的详细教程
tags:
  - 技术
  - 思考
  - 教程
category: MoonLight
draft: false
---
:::tip
要求有运用智能手机的基础
:::
#### 先安装逆向工具

直接用[图形化界面](https://zh.wikipedia.org/wiki/%E5%9B%BE%E5%BD%A2%E7%94%A8%E6%88%B7%E7%95%8C%E9%9D%A2)，为了省事

- ## 安装Apache Ant
    
    假设您已经在计算机上下载并安装了Java开发工具包（[JDK](https://zh.wikipedia.org/wiki/JDK)）。如果没有，请按照 **/java/java-rumen.html**
    
    - 确保JAVA_HOME环境变量设置为JDK所在的文件夹。
        
    - 下载二进制文件[https://ant.apache.org](https://ant.apache.org/)
        
    - 使用Winzip、[winRAR](https://zh.wikipedia.org/wiki/WinRAR)、[7-zip](https://zh.wikipedia.org/wiki/7-Zip)或类似工具将zip文件解压缩到一个方便的位置c:\。
        
    - 创建一个名为的**ANT_HOME**新[环境变量](https://zh.wikipedia.org/wiki/%E7%8E%AF%E5%A2%83%E5%8F%98%E9%87%8F)指向 Ant 安装文件夹。在这种情况下，它是**c:\apache-ant-1.10.12-bin**文件夹。
        
    - 将 Apache Ant 批处理文件的路径附加到 PATH 环境变量。在我们的例子中，这将是**c:\apache-ant-1.10.12-bin\bin**文件夹。
想了想，不安装了，好费事，还不如用MT管理器

另外就是搭建了[图床](https://zh.wikipedia.org/wiki/%E7%BD%91%E7%BB%9C%E7%9B%B8%E5%86%8C)，依旧是走的[cloudflare](https://zh.wikipedia.org/wiki/Cloudflare)，主要是为了保证安全，不然用别的也没问题
流程见图

## 需要的工具
![图片，看不到请翻墙](https://image.342191.xyz/file/AgACAgUAAyEGAASrPZpLAAMHaK68eGH3aWi0H85gj06QWivZQpwAAhvJMRv4-HlVi0N2vTDZvhEBAAMCAANtAAM2BA.png)
LSPath，Mt管理器

![图片](https://image.342191.xyz/file/AgACAgUAAyEGAASrPZpLAAMIaK68qdSFRXKwybN3u9g2YgZVjPwAAhzJMRv4-HlVk_pQTUeFgvMBAAMCAAN4AAM2BA.png)

然后勾选

![图片，看不到请翻墙](https://image.342191.xyz/file/AgACAgUAAyEGAASrPZpLAAMJaK6803Q2J-ZO8UDI-0dc1jLzeFAAAh3JMRv4-HlVqvoKPwbatigBAAMCAAN4AAM2BA.png)


![图片，看不到请翻墙](https://image.342191.xyz/file/AgACAgUAAyEGAASrPZpLAAMKaK684cChQ0CGU7G63to5cXxYIO4AAh7JMRv4-HlVSwEE5twxwu8BAAMCAAN4AAM2BA.png)



![图片，看不到请翻墙](https://image.342191.xyz/file/AgACAgUAAyEGAASrPZpLAAMLaK68_7_MnBZDUPkAAbau2b0sY25LAAIfyTEb-Ph5VSbF3KnK9BVrAQADAgADeAADNgQ.png)

找到文件名，并且安装
如果安装失败，请看下一步

![图片，看不到请翻墙](https://image.342191.xyz/file/AgACAgUAAyEGAASrPZpLAAMMaK69Gs38cDX6Iw5CjqlAN2c4GoQAAivJMRv4-HlV1NeytN1-AZABAAMCAAN4AAM2BA.png)

访问图片当中的目标目录，并安装
![图片，看不到请翻墙](https://image.342191.xyz/file/AgACAgUAAyEGAASrPZpLAAMNaK69KxGxeZIoXWFEyKadzTiBj0IAAizJMRv4-HlVJj0055kioBgBAAMCAAN5AAM2BA.png)