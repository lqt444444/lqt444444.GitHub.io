---
title: wiki-links-post-in-stackoverflow
published: 2025-09-07
description: wiki-links-post-in-stackoverflow
tags:
  - 技术
  - 思考
category: 随笔
draft: false
---
As I am also maintaining a blog website using Astro and managing blog contents of my site using Obsidian, my experience might be of some help.

# Difference between Obsidian and Astro's markdown parsers

To begin with, I will show the difference between Obsidian and Astro's markdown parser.

- Obsidian. Obsidian adds a few useful syntaxes to the [CommonMark](https://commonmark.org/) Specs, including wikilinks and callouts. Obsidian's markdown parser (though close-sourced) is able to parse these elements and turn them into proper HTML.
- Astro. On the other hand, Astro's markdown parser is the open-sourced [`remark`](https://github.com/remarkjs/remark). `Remark` is written according to the CommonMark Specs, and therefore it does not support wikilinks. However, `remark` is extensible, and we can add some plugins to them make it support customized wiki link syntax.

So the main challenge here is to get a plugin of remark that can add wiki link syntax support to `remark`. Fortunately, you would be able to find one existing plugin [`@portaljs/remark-wiki-link`](https://github.com/datopian/portaljs/tree/main/packages/remark-wiki-link).

# Add `@portaljs/remark-wiki-link` into Your Astro Project

After installation of this plugin, to make `@portaljs/remark-wiki-link` work, you also need to configure it. My suggestion is that

- either you pass all pages' urls to this plugin's `permalinks` option, from which it can find the correct page url corresponding to `Page Name` in your wiki link `[[Page Name]]`;
- or use absolute wiki link paths in Obsidian, and make this plugin auto-generate the url of `[[Page Name]]`.

I have chosen the second approach, because it is more convenient. Here I post the related code segment inside `astro.config.mjs` file:

```javascript
import { defineConfig } from "astro/config";
import wikiLinkPlugin from "@portaljs/remark-wiki-link";

// Here I assume your pages' urls are of format
// https://yourwebsite.com/posts/slug
// where slug is the slug of your markdown content
const pageUrlPathPrefix = 'posts/';

export default defineConfig({
  markdown: {
    remarkPlugins: [
      [wikiLinkPlugin, { 
        pathFormat: 'obsidian-absolute', 
        // generate url of the linked page.
        // here `slug` would be "Page Name" for wiki link [[Page Name]].
        wikiLinkResolver: (slug) => [pageUrlPathPrefix + slug] 
      }],
    ]
  }
});
```

Inside Obsidian, you will need to do:

1. change your wiki links in Obsidian into absolute format.
2. make sure that `Page Name` inside `[[Page Name]]` be the slug of the page you link to.
    
    > Note that in Astro, markdown file name does not equal to the slug of that markdown file.
    

After the steps above, things should work. You can refer to [the official documentation](https://github.com/datopian/portaljs/blob/main/packages/remark-wiki-link/README.md) of this plugin for more information.

There are also other custom syntaxes of markdown in Obsidian, e.g. callouts. If you also want to make Astro parse callouts, I recommend you to check my plugin [`remark-callout`](https://github.com/rk-terence/gz-remark-callout).