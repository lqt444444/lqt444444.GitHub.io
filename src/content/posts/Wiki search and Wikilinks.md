---
title: Wiki search and Wikilinks
published: 2025-09-07
description: 适配反向链接与维基词条
tags:
  - 技术
  - 思考
category: 博客
draft: false
---

### 自动链接到维基百科

#### 插件：**Wikipedia**


1.  在 Obsidian 的 `设置` > `社区插件` 中，浏览并安装 "Wikipedia" 插件
2.  当文章中选中这个词。
3.  在 Windows 上按 `Ctrl + P`
4.  插件会搜索该术语，并在弹窗中显示维基百科的结果。
5.  选择正确的条目后，插件会自动将选中的文本 "相对论" 转换为一个指向维基百科页面的 Markdown 链接

这个过程是半自动的，简化了查找和插入维基百科链接的步骤

---

### 自动链接到站内文章


#### 1：在 Obsidian 中创建内部链接

Obsidian 的核心功能就是通过 `[[双向链接]]` (Wikilinks) 的语法来连接笔记

*   **Note Linker**：这个插件可以扫描当前的笔记，寻找与 Vault 中其他笔记标题或别名匹配的文本，然后以列表形式供选择，一键即可创建链接。 它的非侵入性很强，可以在写完后统一处理链接。
*   **Various Complements**：这个插件提供自动补全功能。当输入一个词，如果这个词恰好是另一篇笔记的标题，它会直接建议将其转换为内部链接。

**写作流程：**
1.  正常撰写的博文。
2.  当提到另一篇文章的主题时，使用 `[[另一篇文章的标题]]` 语法创建链接。
3.  或者，在写完后，使用 Note Linker 插件的命令，让它自动扫描并提示所有可能的内部链接。

#### 2：让 Astro 构建这些内部链接

Obsidian 使用的 `[[Wikilink]]` 格式不是标准的 Markdown 语法，Astro 默认无法将其转换为正确的 HTML 网页链接。需要一个 Astro 集成或 Remark/Rehype 插件来处理这个问题。

**解决方案：使用 Remark/Rehype 插件**

Astro 在构建时使用 [Remark](https://remark.js.org/) 和 [Rehype](https://rehype.js.org/) 来处理 Markdown。可以在 Astro 配置文件中添加一个插件，将 Wikilinks 转换为标准的相对路径链接。

一个很好的选择是 **`remark-wiki-link`**。

**配置方法：**
1.  **安装插件**：
    ```bash
    npm install remark-wiki-link
    ```

2.  **配置 `astro.config.mjs`**：
    在的 Astro 配置文件中，导入并使用这个插件。需要配置它如何将笔记标题解析为正确的 URL 路径。

    ```javascript
    // astro.config.mjs
    import { defineConfig } from 'astro/config';
    import remarkWikiLink from 'remark-wiki-link';

    export default defineConfig({
      markdown: {
        remarkPlugins: [
          [
            remarkWikiLink,
            {
              // 这个函数告诉插件如何根据笔记标题生成 URL
              // 例如，将 "My Second Post" 转换为 "/posts/my-second-post/"
              pageResolver: (name) => [name.toLowerCase().replace(/ /g, '-')],
              // Astro 博客文章的 URL 前缀
              hrefTemplate: (permalink) => `/posts/${permalink}`,
              // 让链接显示为普通的 <a> 标签
              wikiLinkClassName: '',
              // 让新窗口链接也显示为普通 <a> 标签
              newClassName: ''
            }
          ]
        ],
        // 如果还想使用其他 rehype 插件，可以在这里添加
        rehypePlugins: [],
      },
    });
    ```

**工作原理**：
当运行 `npm run build` 时，Astro 的构建流程会：
1.  读取在 Obsidian 中编辑的 Markdown 文件。
2.  `remark-wiki-link` 插件会找到所有的 `[[文章标题]]` 链接。
3.  根据在 `astro.config.mjs` 中定义的规则，将它们转换成 `<a href="/posts/文章标题的小写-短横线格式/">文章标题</a>`。
4.  最终生成一个链接结构完全正确的静态网站。

### 总结：完整的自动化流程

1.  **环境搭建**：创建 Astro 项目和 Obsidian Vault，并使用符号链接将 Astro 的内容目录连接到 Obsidian 中。
2.  **插件安装**：
    *   在 Obsidian 中安装 `Wikipedia Search` 用于快速创建外部链接。
    *   在 Obsidian 中安装 `Note Linker` 或 `Various Complements` 以辅助创建内部链接。
3.  **Astro 配置**：在 `astro.config.mjs` 中安装并配置 `remark-wiki-link` 插件，以确保 Astro 能正确构建内部链接。
4.  **写作体验**：
    *   在 Obsidian 中专注写作。
    *   提及站内其他文章时，使用 `[[文章标题]]`。
    *   需要引用维基百科时，使用 `Wikipedia Search` 插件一键生成链接。
5.  **发布博客**：在的 Astro 项目目录中运行 `git push`（如果使用 Git 部署）或 `npm run build`。的博客网站就会被构建出来，所有链接都会自动解析并正确显示。

通过这套流程，可以获得一个极其高效的写作和发布体验，真正地将的博客构建成一个知识网络，就像自己的个人维基百科一样。