---
title: " 本博客搭建教程"
published: 2025-08-05
description: 这是我用 Astro 搭建的新博客的一篇教程
tags:
  - 技术
  - 思考
  - 教程
  - 静态
  - 博客
category: 前端
draft: false
---
## 所需内容
1. 一个GitHub账号
2. 一个环境为--- Node.js <= 22  pnpm <= 9 的电脑
3. cloudflare账号

## 拉取到本地

::github{repo="saicaca/fuwari"}

使用 [create-fuwari](https://github.com/L4Ph/create-fuwari) 在本地初始化项目。

```shell
# npm
npm create fuwari@latest

# yarn
yarn create fuwari

# pnpm
pnpm create fuwari@latest

# bun
bun create fuwari@latest

# deno
deno run -A npm:create-fuwari@latest
```

1. 通过配置文件 `src/config.ts` 自定义博客，详细修改方式我会放在下面
2. 执行 `pnpm new-post <filename>` 创建新文章，并在 `src/content/posts/` 目录中编辑

## 安装并运行

1. 运行 `pnpm install` 和 `pnpm add sharp` 安装依赖项。  如果电脑上没有安装pnpm，则需要先运行`npm install -g pnpm`。
2. 使用`npm run dev`启动项目，如果正常的话(会显示面这行提示)，浏览器访问127.0.0.1:4321，现在已经可以看到页面
```shell
07:37:17 [content] Syncing content
07:37:17 [content] Synced content

 astro  v5.12.5 ready in 4891 ms

┃ Local    http://localhost:4321/
┃ Network  use --host to expose

07:37:17 watching for file changes...
```
## 绑定GitHub

我在之前搭建Hexo时候 git已经绑定账号了，因此下面都是在你已登录账号的情况下写的教程，如果你没有绑定账号，而出现错误，请去Google一下

绑定 GitHub的方法是有官方教程的，非常通俗易懂 [官方教程](https://docs.astro.build/zh-cn/guides/deploy/)

我这仅仅是转述一下，顺带详细描述一些Bug的解决方式

1. 首先你需要注册一个GitHub账号，并且记住你的用户名
2. 然后创建一个项目名称为：你的账户名.github.io 
>   Astro 维护了一个官方的 GitHub Action `withastro/action` 来帮助你部署项目；你只需很少的配置，就可以完成部署。按照下面的说明可以将你的 Astro 站点部署到 GitHub Pages，如果你需要更多信息，请参阅[这个包的 README](https://github.com/withastro/action)。
3. 此时在 `astro.config.mjs` 中配置文件设置 [`site`](https://docs.astro.build/zh-cn/reference/configuration-reference/#site) 和 [`base`](https://docs.astro.build/zh-cn/reference/configuration-reference/#base) 选项。
```js
import { defineConfig } from 'astro/config'

export default defineConfig({

site: 'https://astronaut.github.io',

base: 'my-repo',

})
```

> 
> `site` 的值必须是以下之一：
> 
> - 基于你的用户名的以下网址：`https://<username>.github.io`
> - 为 [GitHub 组织的私有页面](https://docs.github.com/en/enterprise-cloud@latest/pages/getting-started-with-github-pages/changing-the-visibility-of-your-github-pages-site) 自动生成的随机网址：`https://<random-string>.pages.github.io/`
> 
> 可能需要为 `base` 设置一个值，以便 Astro 将你的仓库名称（例如 `/my-repo`）视为你网站的根目录。
> 
> 注意
> 
> 如果出现了以下情况，则不要设置 `base` 参数：
> 
> - 你的页面是由根文件夹所提供。
> - 你的源码存储库是位于 `https://github.com/<USERNAME>/<USERNAME>.github.io`。
> 
> `base` 的值应该是你的仓库名称，以正斜杠开头，例如 `/my-blog`。这样做是为了让 Astro 理解你的网站根目录是 `/my-repo`，而不是默认的 `/`。
> 
> 警告
> 
> 当配置了这个值后，你所有的内部页面链接都必须以你的 `base` 值作为前缀

4. 在你的项目中的 `.github/workflows/` 目录创建一个新文件 `deploy.yml`，并粘贴以下 YAML 配置信息。
```yml
name: Deploy to GitHub Pages

on:
  # 每次推送到 `main` 分支时触发这个“工作流程”
  # 如果你使用了别的分支名，请按需将 `main` 替换成你的分支名
  push:
    branches: [ main ]
  # 允许你在 GitHub 上的 Actions 标签中手动触发此“工作流程”
  workflow_dispatch:

# 允许 job 克隆 repo 并创建一个 page deployment
permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout your repository using git
        uses: actions/checkout@v4
      - name: Install, build, and upload your site
        uses: withastro/action@v3
        # with:
          # path: . # 存储库中 Astro 项目的根位置。（可选）
          # node-version: 20 # 用于构建站点的特定 Node.js 版本，默认为 20。（可选）
          # package-manager: pnpm@latest # 应使用哪个 Node.js 包管理器来安装依赖项和构建站点。会根据存储库中的 lockfile 自动检测。（可选）

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

5. 在 GitHub 上，跳转到存储库的 **Settings** 选项卡并找到设置的 **Pages** 部分。
6. 选择 **GitHub Actions** 作为你网站的 **Source**，然后按 **Save**。
7. 提交（commit）这个新的“工作流程文件”（workflow file）并将其推送到 GitHub。

## 推送到GitHub
第一次可能要键入你创建项目时候GitHub提供的提交代码，用来绑定项目
```shell
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin git@github.com:你用户名/你项目名.git
git push -u origin main
```
 直接输入`npm run format`先[^1]规整格式，而后`git add .`，之后 `git commit -m "eeexxxxaaaammmpppllleeee"`，最后 `git push`



---

附: rc/config.ts详细修改教程
```ts
// 导入配置文件所需的类型定义
import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

// --- 网站核心配置 ---
export const siteConfig: SiteConfig = {
	title: "LiQiuTing", // 网站主标题，会显示在浏览器标签页上
	subtitle: "LiQiuTing", // 网站副标题，会显示在主页上
	lang: "zh_CN", // 网站语言, 支持 'en', 'zh_CN' (简体中文), 'zh_TW' (繁体中文), 'ja' (日文), 'ko' (韩文) 等

	// --- 网站主题颜色配置 ---
	themeColor: {
		hue: 250, // 主题色的色相值，范围 0 到 360。例如: 红色 0, 绿色 120, 青色 250, 粉色 345
		fixed: false, // 如果设置为 true, 访客将无法自行切换主题颜色
	},

	// --- 首页横幅图片配置 ---
	banner: {
		enable: false, // 是否启用首页顶部的大横幅图片
		src: "assets/images/demo-banner.png", // 图片路径。相对于 /src 目录。如果以'/'开头, 则相对于 /public 目录
		position: "center", // 图片显示位置, 相当于 CSS 的 object-position。可选 'top', 'center', 'bottom'。默认为 'center'
		credit: {
			enable: false, // 是否在图片下方显示版权信息
			text: "", // 要显示的版权文字
			url: "", // (可选) 指向原图或作者主页的链接
		},
	},

	// --- 文章目录 (TOC) 配置 ---
	toc: {
		enable: true, // 是否在文章页面右侧显示目录
		depth: 2, // 目录显示的最大标题深度, 范围 1 到 3 (例如, 2 表示只显示 h1 和 h2 标题)
	},

	// --- 网站图标 Favicon 配置 ---
	favicon: [
		// 保持这个数组为空, 则会使用默认的图标
		// 你可以自定义多个图标, 例如:
		// {
		//   src: '/favicon/icon.png',    // 图标路径, 相对于 /public 目录
		//   theme: 'light',              // (可选) 'light' 或 'dark', 用于为亮色和暗色模式设置不同图标
		//   sizes: '32x32',              // (可选) 图标尺寸
		// }
	],
};

// --- 顶部导航栏配置 ---
export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home, // 指向首页的链接
		LinkPreset.Archive, // 指向归档页面的链接
		LinkPreset.About, // 指向关于页面的链接
		{
			name: "GitHub", // 链接名称
			url: "https://github.com/saicaca/fuwari", // 目标 URL 地址
			external: true, // 设置为 true, 会显示一个外部链接图标, 并在新标签页中打开
		},
	],
};

// --- 左侧个人简介配置 ---
export const profileConfig: ProfileConfig = {
	avatar: "assets/images/demo-avatar.png", // 你的头像图片路径。规则同上方的 banner.src
	name: "LiQiuTing", // 你的名字或昵称
	bio: "什么都没有", // 一段关于你的简短介绍
	links: [
		// 你的社交媒体链接
		{
			name: "Twitter", // 链接名称
			icon: "fa6-brands:twitter", // 图标代码, 可在 https://icones.js.org/ 网站查找
			// 注意: 如果你使用的图标集未被项目默认包含, 你需要手动安装它
			// 例如: `pnpm add @iconify-json/<图标集名称>`
			url: "https://twitter.com",
		},
		{
			name: "Steam",
			icon: "fa6-brands:steam",
			url: "https://store.steampowered.com",
		},
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/saicaca/fuwari",
		},
	],
};

// --- 文章底部许可证配置 ---
export const licenseConfig: LicenseConfig = {
	enable: true, // 是否在每篇文章末尾显示许可证信息
	name: "CC BY-NC-SA 4.0", // 许可证名称
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/", // 指向许可证完整内容的链接
};

// --- 代码块高亮样式配置 (基于 Expressive Code) ---
export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// 注意: 某些样式(如背景色)已被项目覆盖, 具体请查看 astro.config.mjs 文件。
	// 请选择一个暗色主题, 因为本博客主题目前只支持暗色背景。
	theme: "github-dark", // 可选的主题, 例如 'dracula', 'nord', 'material-theme-darker' 等
};

```

[^1]: 原因是因为防止文件的格式不符合 Biome 工具设定的规范
