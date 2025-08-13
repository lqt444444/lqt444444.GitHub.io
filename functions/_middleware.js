/**
 * Cloudflare Pages Middleware
 * 功能: 检测并屏蔽来自微信和QQ内置浏览器的访问
 */
export async function onRequest(context) {
    // 从请求头中获取 User-Agent
    const userAgent = context.request.headers.get('User-Agent') || '';

    // 定义微信和QQ的 User-Agent 关键词
    const blockKeywords = ['MicroMessenger', 'QQ/', 'MQQBrowser'];

    // 检查 User-Agent 是否包含任何一个关键词
    const isBlocked = blockKeywords.some(keyword => userAgent.includes(keyword));

    // 如果是来自被屏蔽的浏览器
    if (isBlocked) {
        // 获取我们之前创建的 block.html 页面的 URL
        const blockPageUrl = new URL('/block.html', context.request.url);

        // 从项目的静态资源中获取 block.html 的内容并直接返回
        // 这样做比重定向更快，体验更好
        return await context.env.ASSETS.fetch(blockPageUrl);
    }

    // 如果不是被屏蔽的浏览器，则继续处理正常的请求
    return await context.next();
}