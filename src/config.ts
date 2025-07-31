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