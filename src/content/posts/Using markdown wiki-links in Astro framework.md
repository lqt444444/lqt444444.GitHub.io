---
title: Using markdown wiki-links in Astro framework
published: 2025-09-07
description: Using markdown wiki-links in Astro framework
tags:
  - 技术
  - 思考
category: 博客
draft: false
---
转载
# remark-wiki-link



解析和渲染 Markdown 中的维基风格链接，特别是 Obsidian 风格的链接。

## 这是什么？


使用 Obsidian 时，当我们输入维基链接语法，例如 ``[[wiki_link]]``，它会将其解析为锚点。

## 支持的功能


- [x] 支持 `[[内部链接]]`
- [x] 支持 `[[Internal link|With custom text]]`
- [x] 支持 `[[内部链接#标题]]`
- [x] 支持 `[[Internal link#heading|With custom text]]`
- [x] 支持 `![[Document.pdf]]`
- [x] 支持 `![[Image.png]]`

- 支持的图片格式有 jpg、jpeg、png、apng、webp、gif、svg、bmp、ico
- 不支持的图片格式将显示为原始的维基链接字符串，例如 `[[Image.xyz]]`。

未来支持：

- [ ] 支持 `![[Audio.mp3]]`
- [ ] 支持 `![[Video.mp4]]`
- [ ] 支持 `![[Embed note]]`
- [ ] 支持 `![[Embed note#heading]]`


```shell
npm install @portaljs/remark-wiki-link
```

## 使用方法



```js
import unified from "unified";
import markdown from "remark-parse";
import wikiLinkPlugin from "@portaljs/remark-wiki-link";

const processor = unified().use(markdown).use(wikiLinkPlugin);
```

## 配置选项



### `pathFormat`



类型： `"raw" | "obisidan-absolute" | "obsidian-short"` 默认值：`"raw"`

- `"raw"`: 使用此选项用于常规相对路径或绝对路径（或 Obsidian 相对路径），例如 `[[../some/folder/file]]` 或 `[[[/some/folder/file]]]`，
- `"obsidian-absolute"`: 使用此选项用于 Obsidian 绝对路径，即不带开头 `/` 的路径，例如 `[[some/folder/file]]`
- `"obsidian-short"`: 使用此选项用于 Obsidian 简短路径，例如 `[[file]]` 以解析为绝对路径。注意，除了设置此值外，您还需要将内容文件夹中文件的路径列表传递给 `permalinks` 选项。您可以自行生成此列表或使用我们的 util 函数 `getPermalinks`。更多信息请见下文。

注意

在 Obsidian 中，Wiki 链接格式可以在设置 -> 文件和链接 -> 新链接格式中配置。

### `aliasDivider`



类型：单个字符字符串 默认值：`"|"`

用于 wiki 链接中的别名分隔符。例如：`[[/some/folder/file|Alias]]`

### `permalinks`



类型：`Array<string>` 默认值：`[]`

要与你 wiki 链接路径匹配的永久链接列表。匹配的 wiki 链接将具有 `node.data.exists` 属性设置为 `true`。不匹配的 wiki 链接还将设置附加类 `new`。

### `wikiLinkResolver`



类型： `(name: string) => Array<string>` 默认： `(name: string) => name.replace(/\/index$/, "")` (简体；完整版本请查看源代码)

一个函数，它将接收维基链接目标页面（例如 `[[/some/folder/file#Some Heading|Some Alias]]` 维基链接中的 `"/some/folder/file"`），并返回一个维基链接 **可以** 解析到的页面数组（其中一个将被使用，具体取决于是否传递了 `pemalinks`，以及是否找到匹配项）。

如果传递了 `permalinks`，结果数组将与之匹配以找到匹配项。匹配的 pemalink 将被用作节点的 `href`（或图像的 `src`）。

如果没有找到匹配的永久链接，则该函数返回的数组中的第一个项目将被用作节点的`href`（对于图片则是`src`）。因此，如果你想要编写自定义的维基链接-> URL

### `newClassName`



类型：`string` 默认值：`"new"`

为没有找到匹配的永久链接（通过`permalinks`选项传递）的 wiki 链接创建的节点添加的类名。

### `wikiLinkClassName`



类型：`string` 默认值：`"internal"`

为所有维基链接节点添加类名。

### `hrefTemplate`



类型：``(permalink: string) => string`` 默认值： `(permalink: string) => permalink`

一个函数，用于将匹配的维基链接的 permalink 转换为`href`（对于图片则为`src`）。

### `markdownFolder` ❌ (自 1.1.0 版本起已弃用)



一个指向内容文件夹的字符串，用于解析 Obsidian 简化的维基链接路径格式。

与其使用此选项，不如使用例如从本包导出的 `getPermalinks` 工具函数，从你的内容文件夹生成一组永久链接，并将它们显式地作为 `permalinks` 选项传递。

## 从内容文件夹中生成永久链接列表，使用 `getPermalinks`


如果你使用缩短路径格式来设置你的 Obsidian 知识库链接，为了正确解析它们指向的路径，你需要设置 `option.pathFormat: "obsidian-short"` ，同时还需要向插件提供指向你内容文件夹中文件的永久链接列表作为 `option.permalinks`。你可以使用自己的脚本来生成这个列表，或者像这样使用我们的 util 函数 `getPermalinks`：

```js
import unified from "unified";
import markdown from "remark-parse";
import wikiLinkPlugin from "@portaljs/remark-wiki-link";
import { getPermalinks } from "@portaljs/remark-wiki-link";

const permalinks = await getPermalinks("path-to-your-content-folder");

const processor = unified().use(markdown).use(wikiLinkPlugin, {
  pathFormat: "obsidian-short",
  permalinks,
});
```

## 运行测试


```shell
pnpm nx test remark-wiki-link
```