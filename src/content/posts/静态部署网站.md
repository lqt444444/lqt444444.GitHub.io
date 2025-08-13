---
title: 如何将你的 Astro 网站部署到 Cloudflare、Vercel 和 Netlify
published: 2025-08-06
description: 如何将你的 Astro 网站部署到 Cloudflare、Vercel 和 Netlify
tags:
  - 技术
  - 思考
  - 静态
  - 托管
  - 博客
category: 前端
draft: false
---
## 如何将你的 Astro 网站部署到 Cloudflare、Vercel 和 Netlify

如何将基于 Astro框架的静态网站分别托管到 Cloudflare Pages、Vercel 和 Netlify 这三个主流平台。

### 准备工作

在开始之前，请确保已准备好以下基本要素：

*   **一个 GitHub 账号**：用于存放网站项目代码。
*   **一个一级域名**：将用于访问线上网站的自定义域名。
*   **项目代码已托管至 GitHub**：确保你的 Astro 项目已经推送到了一个 GitHub 仓库中。

---

### **方案一：托管到 Cloudflare Pages**

**演示网站:** `blog.342191.xyz`

#### **需要准备：**

*   一个 Cloudflare 账号，并完成与 GitHub 账号的关联。
*   一个计划用于 Cloudflare 的一级域名。

#### **具体步骤：**

1.  **登录 Cloudflare 控制台**
    访问 [Cloudflare Dashboard](https://dash.cloudflare.com/) 并登录账户。

2.  **创建 Pages 项目**
    在左侧导航栏中，找到并点击 **Workers 和 Pages**，然后选择 **创建应用程序** > **Pages** > **连接到 Git**。

3.  **选择 GitHub 仓库**
    选择 GitHub 账户并授权，然后选取托管网站代码的仓库。

4.  **配置构建设置**
    Cloudflare 会自动识别 Astro项目并填充预设。请确认或设置以下内容：
    *   **框架预设**: `Astro`
    *   **构建命令**: `npm run build`
    *   **构建输出目录**: `/dist`
    *   **根目录**: `/` (如果你的项目在仓库根目录)

5.  **设置环境变量（推荐）**
    为确保线上构建环境与你的本地开发环境一致，避免因 `Node.js` 版本差异导致构建失败（例如 CSS 样式错误），建议添加环境变量。
    *   在本地项目终端中运行 `node -v` 查看你的 Node.js 版本（我的版本号 `v22.2.0`）。
    *   在 Cloudflare Pages 项目的 **设置** > **环境变量** 中，添加一个**生产**环境变量：
        *   **变量名**: `NODE_VERSION`
        *   **值**: `22.2.0` (请替换为你自己的版本号)

6.  **部署与自定义域名**
    点击 **保存并部署**。部署成功后，进入项目设置，绑定你的**自定义域名**。Cloudflare 会引导你完成域名的验证和 DNS 记录的添加。

7.  **（可选）DNS 优化以提升访问速度**
    为了在特定区域（如中国大陆）获得更快的访问速度，可以不使用 Cloudflare 默认的 DNS 解析，而是通过第三方 DNS 服务商（如华为云解析），将你的域名通过 `A` 记录指向一个优选的 Cloudflare IP。
    > **注意**：这是一个高级技巧，需要你自行寻找并测试稳定可靠的优选 IP。我提供了一个个人维护的优选 CNAME 地址作为参考： `*.cf.342191.xyz`。

---

### **方案二：托管到 Vercel**

Vercel 是 Next.js 的母公司，兼容性超级舒服

**演示网站:** `vercel.342191.xyz`

#### **需要准备：**

*   一个 Vercel 账号，并完成与 GitHub 账号的关联。

#### **具体步骤：**

1.  **登录 Vercel 并导入项目**
    访问 [Vercel 官网](https://vercel.com/)，使用 GitHub 账号登录。在控制面板点击 **Add New...** > **Project**，然后选择并导入 Astro 项目仓库。

2.  **配置项目**
    Vercel 会自动识别为 Astro 项目并配置好构建设置。直接点击 **Deploy**。

3.  **设置环境变量（可选但推荐）**
    与 Cloudflare 类似，可以在项目的 **Settings** > **Environment Variables** 中添加 `NODE_VERSION`，以确保构建环境的一致性。

4.  **添加自定义域名**
    部署完成后，在项目控制台的 **Settings** > **Domains** 中，输入你的自定义域名并添加。Vercel 会提供相应的 `A` 记录或 `CNAME` 记录，请前往域名那里完成解析。

5.  **（可选）使用优选节点**
    同样，为了优化特定区域的访问速度，你可以将域名 CNAME 解析到由社区维护的 Vercel 优选节点上。
    >参考示例： `vercel.342191.xyz`。

---

### **方案三：托管到 Netlify**

Netlify 是最早提供静态网站自动化部署服务的平台之一

**演示网站:** `netlify.342191.xyz`

#### **你需要准备：**

*   一个 Netlify 账号，并完成与 GitHub 账号的关联。

#### **具体步骤：**

1.  **登录 Netlify 并导入项目**
    访问 [Netlify](https://app.netlify.com/) 并登录。仪表盘连接到 GitHub 并选择你的项目仓库。

2.  **初始部署**
    Netlify 通常会自动检测并完成部署。部署后，你可以设置你的站点名称和自定义域名。

3.  **问题排查：修复 404 错误**
    有时 Astro 项目在 Netlify 上初次部署后可能会出现页面 404 的情况。这通常是构建设置不正确导致的。请按以下步骤修复：
    a. 进入你项目主页，在左侧菜单找到 **Deploys**。
    b. 点击页面上方的 **Deploy settings** 链接。
    c. 在 **Build & deploy** > **Build settings** 部分，点击 **Edit settings**。
    d. 确保你的配置如下表所示，特别是 **Publish directory** 必须为 `dist`：

| 设置项                   | 值                   |
| :-------------------- | :------------------ |
| Base directory        | `(not set)`         |
| Build command         | `npm run build`     |
| **Publish directory** | `dist`              |
| Functions directory   | `netlify/functions` |

4.  **重新部署**
    保存修改后的构建设置。返回 **Deploys** 页面，在顶部找到 **Trigger deploy** 下拉菜单，选择 **Deploy site** 来手动触发一次新的构建。

5.  **（可选）DNS 优化**
    Netlify 的全球 CDN 速度已经非常优秀。如果仍有优化需求，你可以像前两种方案一样，将域名解析到自定义的优选 IP 上。
