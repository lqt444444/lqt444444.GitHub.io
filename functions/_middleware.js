// public/speed-test.js

(function() {
    // --- 在这里配置你要测速的节点 ---
    const nodes = [
        'https://vercel.342191.xyz',
        'https://blog.342191.xyz',
        'https://netlity.342191.xyz' // 拼写修正：应为 netlify? 请根据你的实际情况修改
    ];
    // ------------------------------------

    const STORAGE_KEY = 'fastestNode';
    const EXPIRATION_KEY = 'fastestNodeExpiration';
    const CACHE_DURATION = 60 * 60 * 1000; // 缓存1小时 (单位：毫秒)

    function setFastestNode(url) {
        const now = new Date().getTime();
        localStorage.setItem(STORAGE_KEY, url);
        localStorage.setItem(EXPIRATION_KEY, now + CACHE_DURATION);
        console.log(`[Speed Test] Fastest node set to: ${url}, expires in 1 hour.`);
    }

    async function runSpeedTest() {
        console.log('[Speed Test] Running speed test...');
        const promises = nodes.map(async (baseUrl) => {
            const startTime = Date.now();
            try {
                // 使用 HEAD 请求，因为它只获取响应头，速度最快
                // abortController 用于设置超时
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 2000); // 2秒超时

                await fetch(`${baseUrl}/probe.txt`, { method: 'HEAD', signal: controller.signal });
                
                clearTimeout(timeoutId);
                const latency = Date.now() - startTime;
                return { baseUrl, latency };
            } catch (error) {
                clearTimeout(timeoutId);
                // 请求失败或超时的节点，延迟设为无穷大
                return { baseUrl, latency: Infinity };
            }
        });

        const results = await Promise.all(promises);
        console.log('[Speed Test] Results:', results);

        // 找到延迟最低的节点
        const fastest = results.reduce((prev, current) => (prev.latency < current.latency) ? prev : current);

        if (fastest && fastest.latency !== Infinity) {
            setFastestNode(fastest.baseUrl);
            return fastest.baseUrl;
        }
        // 如果所有节点都测试失败，返回当前访问的节点作为备用
        return window.location.origin;
    }

    async function main() {
        const cachedNode = localStorage.getItem(STORAGE_KEY);
        const expiration = localStorage.getItem(EXPIRATION_KEY);
        const now = new Date().getTime();

        let fastestNodeUrl;

        // 如果有缓存且未过期，则直接使用缓存
        if (cachedNode && expiration && now < parseInt(expiration, 10)) {
            console.log(`[Speed Test] Using cached fastest node: ${cachedNode}`);
            fastestNodeUrl = cachedNode;
        } else {
            // 否则，运行新的测速
            fastestNodeUrl = await runSpeedTest();
        }

        // 检查当前域名是否与最快的节点匹配
        const currentOrigin = window.location.origin;
        if (fastestNodeUrl && fastestNodeUrl !== currentOrigin) {
            console.log(`[Speed Test] Current node (${currentOrigin}) is not the fastest. Redirecting to ${fastestNodeUrl}...`);
            
            // 执行跳转
            window.location.href = fastestNodeUrl + window.location.pathname + window.location.search;
        } else {
            console.log(`[Speed Test] You are on the fastest node (${currentOrigin}). No redirection needed.`);
        }
    }

    // 确保在 DOM 加载完成后再执行，避免阻塞页面渲染
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', main);
    } else {
        main();
    }

})();