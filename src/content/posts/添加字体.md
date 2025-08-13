---
title: 如何给 Fuwari自定义字体？
published: 2025-08-10
description: 如何给Astro自定义字体？
tags:
  - 技术
  - 思考
  - 美化
  - 博客
  - 静态
  - 教程
category: 教程
draft: false
---
:::warning[警告]
添加字体会降低网站访问速度与流量使用，请慎重选择，出于安全性考虑，本博客已经从main.css当中删除字体，如果你想要使用此废稿，请仅需修改CSS
:::
## 前言

- 你需要准备Python环境
- 一个你下载好的字体
## 在  [Fuwari](https://github.com/saicaca/fuwari) 中使用自定义字体

本教程将教学如何将自定义字体，并通过配置文件进行全局管理。
> 这篇文章是我先写出大体框架，教给AI润色的，因为我写的可能有语句不通顺，还望见谅
> Tailwind是Fuwari搭载的CSS框架
---

### **第一步：准备字体文件**

首先，你需要拥有字体文件。字体格式是 `.woff2`，`.woff`，其他格式似乎不行，你可以从 Google Fonts 等服务下载字体，但是谷歌font字体支持中文的太少了，我这里使用的是自己的字体文件（原神聊天框用的字体-HYWenHei-75W）。
> 实际上woff和woff2内存占用差不多，你反正看心情用就好

下载后，在你的项目结构中创建一个专门存放字体的目录。将其放在 `public/fonts/`

例如，项目结构可能如下所示：

```json
/public
  /fonts
    - HYWenHei-75W-subseit.woff
//没有就创建一个对应的文件夹
/src
  /styles
    - main.css //这是全局的CSS。等会用于导入字体
tailwind.config.js
...
```

---

### **第二步：通过 `@font-face` 加载字体**

有了字体文件后，你需要在主 CSS 文件中通过 `@font-face` 规则来“声明”这些字体。

打开你的全局 CSS 文件，添加 `@font-face` 规则。

**示例**：假设想加载一个名为 `Oswald` 的自定义字体。

```css
/* src/styles/main.css */

@layer base {
  @font-face {
    font-family: 'Oswald'; /* 为字体命名 */
    font-style: normal; /* 样式，如 normal, italic */
    font-weight: 400; /* 字重 */
    font-display: swap; /* 字体加载策略，swap 表示先显示后备字体 */
    src: url(HYWenHei-75W-subseit.woff) format('woff'); /* 字体文件路径 */
  }
}
```

**关键点**：
*   **`font-family`**: 你为这个字体设定的名字，稍后将在 Tailwind 配置中使用。
*   **`src`**: 指向你第一步中存放的字体文件的路径。如果字体放在 `public` 目录下，路径通常以 `/` 开头。
*   **`font-weight` / `font-style`**: 定义该字体文件对应的字重和样式。如果你有多个字重的字体文件（如 `Regular`, `Bold`, `Light`），你需要为每个文件分别声明一个 `@font-face` 规则。
*   **`font-display: swap;`**: 这是一个优化策略，它让浏览器在自定义字体加载完成前，先使用后备字体显示文本，避免内容空白。
*   **`@layer base`**: 建议将 `@font-face` 规则放在 `@layer base` 中，以确保它被正确地包含在你的基础样式里。

---

### **第三步：将字体添加到 Tailwind 配置**

现在，你需要告诉 Tailwind 你的新字体的存在，你需要编辑项目根目录下的 `tailwind.config.js` 文件。

在 `theme.extend.fontFamily` 对象中，添加你刚刚定义的字体。

**示例**：将 `Oswald` 添加为一个名为 `display` 的字体系列，并将默认的无衬线字体 (`sans`) 作为后备。

```javascript
// tailwind.config.js

const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // 将 'Oswald' 添加到默认的 sans-serif 字体栈中
        // 'sans' 是默认的无衬线字体系列
        sans: ['Oswald', ...defaultTheme.fontFamily.sans],
        
        // 创建一个新的 'display' 字体系列
        display: ['Oswald', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
}
```

**配置说明**：
*   **`theme.extend`**: 我们使用 `extend` 来扩展默认主题，而不是完全覆盖它。
*   **`fontFamily`**: 这个对象用于配置字体系列。
*   **`display: ['Oswald', ...]`**: 我们创建了一个名为 `display` 的新字体系列。`'Oswald'` 是主字体。`...defaultTheme.fontFamily.sans` 是一个扩展操作符，它将 Tailwind 默认的无衬线字体（如 `ui-sans-serif`, `system-ui` 等）作为后备字体。这样做的好处是，如果 `Oswald` 加载失败，浏览器会依次尝试后面的字体，保证了网站的可用性。
*   **`sans: ['Inter', ...]`**: 这个例子也展示了如何覆盖默认的 `sans` 字体系列，将其替换为 `Inter` 字体。

## 另附

如何把`ttf`转化为`woff`，又如何把`woff`使用`7000词常用字.txt`缩减内存，加快访问速度，减少服务器使用带宽，
对于中文字体来说，一个完整的字体文件包含数万个汉字，所以体积巨大。创建一个只包含几百或几千个常用字的分包字体，十分有必要

> 需要Python环境

**对于动态网站（如博客、新闻站）**：我们采用一个折中的方案：使用一个**常用汉字集**。

*   网上有整理好的常用汉字表
*   你可以从这里获取一个常用的 3500 字列表：[常用3500汉字表](https://github.com/wy-luke/All-Chinese-Character-Set) ，建议使用7000字，尤其对于博客涵盖内容较大的博主，这很有必要
*   将这些常用字，再加上你网站上确定会用到的所有数字和标点符号，全保存到你的 `characters.txt` 文件中。
1.  **安装 `fonttools`**：
    *   你需要在你的电脑上安装 Python。
    *   然后打开终端，目录输入CMD回车（命令行工具），运行以下命令来安装 `fonttools`：
        ```bash
        pip install fonttools
        ```

2.  **执行分包命令**：
    *   把你的原始字体文件，和刚刚创建的 `characters.txt` 文件放在同一个文件夹下。
    *   在终端里，切换到这个文件夹，然后运行下面的命令：

    ```shell
    pyftsubset HYWenHei-75W.ttf --text-file=characters.txt --output-file=HYWenHei-75W-subset.woff2 --flavor=woff2
    ```

    **命令解释**：
    *   `pyftsubset`：我们刚安装的、用于分包的工具。
    *   `original-font.woff2`：你的原始大字体文件。
    *   `--text-file=characters.txt`：告诉工具，按照这个文本文件里的字符列表来提取。
    *   `--output-file=subset-font.woff2`：指定输出的新字体文件的名字。
    *   `--flavor=woff`：确保输出的格式是我们想要的 `.woff`。

    执行完毕后，你会发现多了一个 `subset-font.woff` 文件。检查一下它的体积，你会发现它可能只有几十到几百 KB
   
   
3. **在项目中使用新的分包字体**：
现在，你只需要像之前的教程一样，在你的 CSS 中引用这个新的、小体积的字体文件即可。
在你的 `src/styles/main.css` 文件中：

```css
@font-face {
  font-family: 'MyCustomFont'; /* 名字保持不变 */
  
  /* 关键：路径指向新的分包字体文件 */
  src: url('/fonts/HYWenHei-75W-subset.woff2') format('woff2'); 
  
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
```

别忘了把 `HYWenHei-75W-subset.woff` 文件也放到 `public/fonts/` 目录下。`tailwind.config.mjs` 配置不需要改变。


---


### 总结

1.  **整理一份常用汉字表**加上你的网站标题等固定文字，保存为 `characters.txt`。
2.  使用 `pip install fonttools` 安装工具。
3.  运行 `pyftsubset` 命令生成一个**体积减小**的 `HYWenHei-75W-subset.woff2`
4.  在你的项目中使用这个新文件。
