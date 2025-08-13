---
title: Fuwari美化
published: 2025-08-13
description: 如何添加透明背景，以及适应多种色彩
tags:
  - 技术
  - 思考
  - 教程
  - 美化
  - 博客
category: 教程
draft: false
---
:::tip
部分内容由AI驱动
部分代码来自[2X树树](2x.nz)
:::
:::Warning
修改存在风险，请注意备份
:::
:::important
请确保您已经阅读并且部署本博客，您也可以fork我的成品，但请确保删除我原先的文章！
:::
:::important
原始版本的Fuwari部署教程在[博客搭建](/posts/博客搭建/)
:::
目标：

1. 实现一个不随页面滚动的、铺满整个视窗的全局背景图。
    
2. 将文章卡片、浮动面板等组件的背景变为半透明的“毛玻璃”效果。
    
3. 确保所有修改都能完美适应主题的亮/暗模式切换。

两个核心文件：

1. **布局结构文件**: `src/layouts/Layout.astro`
    
2. **核心样式文件**: `src/styles/main.css`

### 分离背景与内容层（修改 Layout.astro）

1.  **打开文件**: `src/layouts/Layout.astro`。

2.  **修改 `<body>` 标签内部的结构**：需要在 `<body>` 标签内，创建一个专门用于承载背景的 `<img>` 元素，并用一个新的 `<div>` 将页面上所有其他内容包裹起来。

3.  **移除冲突样式**：在 `<html>` 标签上，必须删除 `class="bg-[var(--page-bg)]"` 这个类，因为它会设置一个不透明的背景色，将我们的背景图完全遮挡。

请参照以下代码进行修改：

```astro
// src/layouts/Layout.astro

// --- 前置代码 (frontmatter) 部分保持不变 ---
// ...

---
<!DOCTYPE html>
<!-- [关键修改 1] 从这里移除了 class="bg-[var(--page-bg)]" -->
<html lang={siteLang} class="transition text-[14px] md:text-[16px]"
	  data-overlayscrollbars-initialize
>
	<head>
        {/* head 内部的所有内容保持不变 */}
		{/* ... */}
	</head>
	<body class=" min-h-screen transition " class:list={[{"lg:is-home": isHomePage, "enable-banner": enableBanner}]}
		  data-overlayscrollbars-initialize
	>
		<!-- [关键修改 2] 在这里添加全局背景图层。它必须独立于所有内容之外。 -->
		<!-- 请将 src 替换为你自己的图片路径。 -->
		<img id="bg" src="/your-background-image.jpg" alt="background">

		<!-- [关键修改 3] 新增一个 div，包裹住你之前 body 内的所有内容。-->
		<div id="app-content-wrapper">
			<ConfigCarrier></ConfigCarrier>
			<slot />

			<!-- increase the page height during page transition to prevent the scrolling animation from jumping -->
			<div id="page-height-extend" class="hidden h-[300vh]"></div>
		</div>
	</body>
</html>

{/* ...底部的 <style> 和 <script> 标签保持不变... */}
```
---

###  定义全局样式（修改 `main.css`）

1.  **打开文件**: `src/styles/main.css`。

2.  **注入**：添加一个新的 `@layer base` 样式层，并在其中定义两个核心规则：
    *   **一**：强制 `<html>` 和 `<body>` 的背景色为透明，以便让底层的 `#bg` 元素能够“透”出来。
    *   **二**：为 `#bg` 元素设置样式，使其固定在屏幕最底层并铺满整个视窗。

3.  **改造样式**：将修改如 `.card-base` 等组件的样式，将它们原本不透明的背景色，替换为带 Alpha 通道的 `rgba()` 半透明颜色，并为其添加 `backdrop-filter` 实现毛玻璃效果。

添加和修改的 `main.css` 代码片段

#### 关键 CSS 代码解析

```css
/* src/styles/main.css */

/* 确保这些指令在文件顶部 */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
    /* 规则一：强制核心容器背景透明 */
    html, body, #swup-container, .page-wrapper, #content-wrapper {
        @apply !bg-transparent;
    }

    /* 规则二：定义背景元素的样式 */
    #bg {
        @apply fixed top-0 left-0 w-full h-full object-cover -z-10;
    }
}

@layer components {
    /* 规则三：为卡片添加半透明玻璃效果 */
    .card-base {
        @apply rounded-[var(--radius-large)] overflow-hidden transition;
        /* 将背景色改为带 75% 不透明度的白色 */
        background-color: rgba(255, 255, 255, 0.75);
        /* 如果浏览器支持，则添加毛玻璃效果 */
        @supports (backdrop-filter: blur(1px)) {
            @apply backdrop-blur-xl;
        }
    }
    /* 深色模式下的半透明背景 */
    .dark .card-base {
        background-color: rgba(30, 41, 59, 0.75);
    }
    
    /* 你可以对 .float-panel 等其他组件应用相同的逻辑... */
}
```

---

### 总结


 `src/styles/main.css` 的全部内容

```css

/* src/styles/main.css */
/**
 * =================================================================
 * Fuwari  main.css
 * @version 25.0
 *
 * 特性:
 * 1. [全局背景] 实现了全屏、固定的图片背景。
 * 2. [玻璃拟物] 为卡片、面板等组件添加了半透明玻璃质感。
 * 3. [动态主题] 确保了所有链接、按钮的颜色能正确跟随主题变化。
 * =================================================================
 */

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
    #swup-container, .page-wrapper, #content-wrapper {
        @apply !bg-transparent;
    }

    #bg {
        @apply fixed top-0 left-0 w-full h-full object-cover -z-10;
    }
}

@layer components {
    /* --- 超链接样式 (完整版，包含圆角悬停动画) --- */
    .custom-md a:not(.no-styling) {
        @apply relative rounded-md p-1 -m-1 font-medium text-[var(--primary)] underline decoration-[var(--link-underline)] decoration-1 decoration-dashed underline-offset-4 transition;
        box-decoration-break: clone;
        -webkit-box-decoration-break: clone;
        &:hover { @apply no-underline; }
        &::before {
            content: '';
            @apply absolute inset-0 rounded-[inherit] -z-10 transition ease-out scale-[0.85] opacity-0;
            background: var(--btn-plain-bg-hover);
        }
        &:hover::before { @apply scale-100 opacity-100; }
        &:active::before { background: var(--btn-plain-bg-active); }
    }

    /* --- 卡片样式 --- */
    .card-base {
        @apply rounded-[var(--radius-large)] overflow-hidden transition;
        background-color: rgba(255, 255, 255, 0.75);
        @supports (backdrop-filter: blur(1px)) { @apply backdrop-blur-xl; }
    }
    .dark .card-base { background-color: rgba(30, 41, 59, 0.75); }
    .card-shadow { @apply drop-shadow-[0_2px_4px_rgba(0,0,0,0.005)]; }

    /* --- 基础动画与链接 --- */
    h1, h2, h3, h4, h5, h6, p, a, span, li, ul, ol, blockquote, code, pre, table, th, td, strong { @apply transition; }
    .expand-animation {
        @apply relative before:ease-out before:transition active:bg-none hover:before:bg-[var(--btn-plain-bg-hover)] active:before:bg-[var(--btn-plain-bg-active)] z-0 before:absolute before:rounded-[inherit] before:inset-0 before:scale-[0.85] hover:before:scale-100 before:-z-10;
    }
    .link { @apply transition rounded-md p-1 -m-1 expand-animation; }
    .link-lg { @apply transition rounded-md p-1.5 -m-1.5 expand-animation; }
    .link-underline { @apply transition underline decoration-2 decoration-dashed decoration-[var(--link-underline)] hover:decoration-[var(--link-hover)] active:decoration-[var(--link-active)] underline-offset-[0.25rem]; }
    
    /* --- 浮动面板样式 --- */
    .float-panel {
        @apply top-[5.25rem] rounded-[var(--radius-large)] overflow-hidden transition shadow-xl dark:shadow-none;
        background-color: rgba(255, 255, 255, 0.8);
        @supports (backdrop-filter: blur(1px)) { @apply backdrop-blur-xl; }
    }
    .dark .float-panel { background-color: rgba(30, 41, 59, 0.8); }
    .float-panel-closed { @apply -translate-y-1 opacity-0 pointer-events-none; }
    
    /* --- 滚动条与搜索 --- */
    .os-scrollbar-horizontal, .os-scrollbar-vertical {
        background-color: rgba(255, 255, 255, 0.75) !important;
        @supports (backdrop-filter: blur(1px)) { backdrop-filter: blur(12px) !important; }
    }
    .dark .os-scrollbar-horizontal, .dark .os-scrollbar-vertical { background-color: rgba(30, 41, 59, 0.75) !important; }
    .search-panel mark { @apply bg-transparent text-[var(--primary)]; }

    /* --- 按钮样式 --- */
    .btn-card { @apply transition flex items-center justify-center bg-[var(--card-bg)] hover:bg-[var(--btn-card-bg-hover)] active:bg-[var(--btn-card-bg-active)]; }
    .btn-card.disabled { @apply pointer-events-none text-black/10 dark:text-white/10; }
    .btn-plain {
        @apply transition relative flex items-center justify-center bg-none text-black/75 hover:text-[var(--primary)] dark:text-white/75 dark:hover:text-[var(--primary)];
        &:not(.scale-animation) { @apply hover:bg-[var(--btn-plain-bg-hover)] active:bg-[var(--btn-plain-bg-active)]; }
        &.scale-animation {
            @apply expand-animation;
            &.current-theme-btn { @apply before:scale-100 before:opacity-100 before:bg-[var(--btn-plain-bg-hover)] text-[var(--primary)]; }
        }
    }
    .btn-regular {
        @apply transition flex items-center justify-center;
        color: var(--btn-content);
        background-color: rgba(226, 232, 240, 0.8);
    }
    .btn-regular:hover { background-color: rgba(203, 213, 225, 0.85); }
    .dark .btn-regular { background-color: rgba(51, 65, 85, 0.7); }
    .dark .btn-regular:hover { background-color: rgba(71, 85, 105, 0.8); }
    .btn-regular-dark { @apply flex items-center justify-center bg-[oklch(0.45_0.01_var(--hue))] hover:bg-[oklch(0.50_0.01_var(--hue))] active:bg-[oklch(0.55_0.01_var(--hue))] dark:bg-[oklch(0.30_0.02_var(--hue))] dark:hover:bg-[oklch(0.35_0.03_var(--hue))] dark:active:bg-[oklch(0.40_0.03_var(--hue))]; }
    .btn-regular-dark.success { @apply bg-[oklch(0.75_0.14_var(--hue))] dark:bg-[oklch(0.75_0.14_var(--hue))]; }
    
    /* --- 功能性样式 --- */
    .toc-hide, .toc-not-ready { @apply opacity-0 pointer-events-none; }
    #toc-inner-wrapper { mask-image: linear-gradient(to bottom, transparent 0%, black 2rem, black calc(100% - 2rem), transparent 100%); }
    .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .text-90, .text-75, .text-50, .text-30, .text-25 { /* ... text opacity classes ... */ }
    .meta-icon {
        @apply w-8 h-8 transition rounded-md flex items-center justify-center text-[var(--btn-content)] mr-2;
        background-color: rgba(226, 232, 240, 0.8);
    }
    .dark .meta-icon { background-color: rgba(51, 65, 85, 0.7); }
    .with-divider { @apply before:content-['/'] before:ml-1.5 before:mr-1.5 before:text-[var(--meta-divider)] before:text-sm before:font-medium before:first-of-type:hidden before:transition; }
}

/* --- 全局微调 --- */
.custom-md img { @apply cursor-zoom-in; }
main.prose { @apply pt-16; }
.page-wrapper > header { @apply pt-32; }
```

---

