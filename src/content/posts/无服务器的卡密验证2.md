---
title: 我的第一篇博客
published: 2025-07-09
description: 这是我用 Astro 搭建的新博客的第一篇文章。
tags:
  - 技术
  - 思考
category: 前端
draft: true
---

## 使用 Cloudflare Workers 和 JWS 打造无懈可击的安卓应用授权系统

在保护我们的安卓应用时，传统的“客户端-服务器-数据库”架构不仅成本高昂，而且维护复杂，容易成为攻击的目标

在本篇博文中，我将带领大家从零开始，构建一个**高安全性、无服务器（Serverless）、无状态（Stateless）**的安卓应用授权系统。我们将利用 Cloudflare Workers 的边缘计算能力和现代密码学标准 JWS (JSON Web Signature)，打造一个仅仅依靠算法和签名就能完成双向验证的坚固堡垒。


### 第一部分

我们系统的核心，不是去信任客户端发送的任何数据，而是去信任一个由我们（管理员）亲自签发的、不可伪造的**“黄金令牌”（Golden Token）**。

这个系统有三个关键角色：

1.  **管理员**:
    *   **资产**：拥有**管理员私钥**（绝对机密）。
    *   **职责**：使用私钥签发包含授权信息（设备ID、过期时间）的令牌

2.  **Cloudflare Worker（验钞机 / 保安）**:
    *   **资产**：拥有**管理员公钥**（用于验证令牌真伪）和自己的 **Worker 私钥**（用于证明自身身份）。
    *   **职责**：作为一个无状态的验证端点，它接收 App 的请求，验证“黄金令牌”的真实性和有效性，然后用自己的私key签名，给 App 一个可信的回执。

3.  **安卓应用（消费者）**:
    *   **资产**：拥有 **Worker 公钥**。
    *   **职责**：向用户索要“黄金令牌”（即卡密），提交给 Worker 验证，并用自己的公钥验证 Worker 的回执是否真实。

这个流程形成了一个完美的信任闭环：**管理员信任自己签发的令牌，Worker 信任管理员的签名，App 信任 Worker 的签名。**

### 第二部分：管理员的工具箱 - 生成密钥与签发令牌

我们需要一个简单的 Node.js 环境来执行这些管理员操作。

#### 步骤 2.1: 生成两对“钥匙”（密钥对）

我们需要两对 ECDSA P-256 密钥：一对用于管理员，一对用于 Worker。

首先，初始化项目并安装 `jose` 库：
`npm init -y`
`npm install jose`

修改 `package.json`，添加 `"type": "module",`。

**`generate-keys.js`**
```javascript
import { generateKeyPair, exportSPKI, exportPKCS8 } from 'jose';
import { promises as fs } from 'fs';

async function generateKeys(prefix) {
    const { publicKey, privateKey } = await generateKeyPair('ES256', { extractable: true });
    const spkiPem = await exportSPKI(publicKey);
    const pkcs8Pem = await exportPKCS8(privateKey);

    await fs.writeFile(`${prefix}_public_key.pem`, spkiPem);
    await fs.writeFile(`${prefix}_private_key.pem`, pkcs8Pem);
    
    console.log(`--- ${prefix}_public_key.pem ---`);
    console.log(spkiPem);
}

console.log('正在生成管理员密钥对...');
await generateKeys('admin');
console.log('\n正在生成 Worker 密钥对...');
await generateKeys('worker');
console.log('\n密钥对已全部生成！');
```

在终端运行 `node generate-keys.js`，你将得到四个文件。请妥善保管它们：
*   `admin_private_key.pem`: **最高机密！**
*   `admin_public_key.pem`: 将部署到 Worker。
*   `worker_private_key.pem`: 将部署到 Worker。
*   `worker_public_key.pem`: 将硬编码到安卓 App 中。

#### 步骤 2.2: 铸造签发卡密



**`issue-token.js`**
```javascript
import { SignJWT, importPKCS8 } from 'jose';
import { promises as fs } from 'fs';

async function issueGoldenToken(deviceId, validityInDays) {
    const privateKeyPem = await fs.readFile('admin_private_key.pem', 'utf-8');
    const privateKey = await importPKCS8(privateKeyPem, 'ES256');
    const expiresAt = Math.floor(Date.now() / 1000) + (validityInDays * 24 * 60 * 60);

    const goldenToken = await new SignJWT({ deviceId, expiresAt })
        .setProtectedHeader({ alg: 'ES256' })
        .sign(privateKey);

    console.log('卡密已生成 ---');
    console.log(`设备ID: ${deviceId}`);
    console.log(`有效期至: ${new Date(expiresAt * 1000).toLocaleString()}`);
    console.log('请将下面的字符串发给用户:');
    console.log(goldenToken);
}

const userDeviceId = process.argv[2];
const days = parseInt(process.argv[3], 10);
if (!userDeviceId || !days) {
    console.log('用法: node issue-token.js <设备ID> <有效天数>');
} else {
    issueGoldenToken(userDeviceId, days);
}
```
**使用**: `node issue-token.js <用户的设备ID> <有效天数>` (例如 `30` 天)。生成的长字符串就是发给用户的卡密。

### 第三部分：验钞机 - Cloudflare Worker 的实现

我们将使用 Wrangler CLI 工具来创建和部署 Worker。

1.  **创建项目**: `npx wrangler init my-license-worker` (选择 `Worker only` 模板)。
2.  **安装依赖**: `cd my-license-worker` 然后 `npm install jose`。
3.  **上传密钥**: 使用 `wrangler secret put` 命令，将 `admin_public_key.pem` 和 `worker_private_key.pem` 的内容分别上传到名为 `ADMIN_PUBLIC_KEY` 和 `WORKER_PRIVATE_KEY` 的环境变量中。

**`src/index.ts` (Worker 最终代码)**
```typescript
import { importSPKI, jwtVerify, SignJWT, importPKCS8 } from 'jose';

export interface Env {
    ADMIN_PUBLIC_KEY: string;
    WORKER_PRIVATE_KEY: string;
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        if (request.method !== 'POST') {
            return jsonResponse({ error: 'Expected POST' }, 405);
        }

        try {
            const { deviceId, token }: { deviceId?: string; token?: string } = await request.json();

            if (!deviceId || !token) {
                return jsonResponse({ isValid: false, reason: 'Missing parameters' }, 400);
            }
            
            // 1. 用管理员公钥验证黄金令牌
            const adminPublicKey = await importSPKI(env.ADMIN_PUBLIC_KEY, 'ES256');
            const { payload: tokenPayload } = await jwtVerify(token, adminPublicKey);

            // 2. 验证业务逻辑
            if (tokenPayload.deviceId !== deviceId) {
                return jsonResponse({ isValid: false, reason: 'Device ID mismatch' });
            }
            if (Math.floor(Date.now() / 1000) > (tokenPayload.expiresAt as number)) {
                return jsonResponse({ isValid: false, reason: 'Token expired' });
            }

            // 3. 所有验证通过，准备成功回执
            const responseData = {
                isValid: true,
                deviceId: tokenPayload.deviceId,
                expiresAt: tokenPayload.expiresAt,
                validatedAt: Math.floor(Date.now() / 1000),
            };

            // 4. 用 Worker 私钥签名回执，生成一个响应JWT
            const workerPrivateKey = await importPKCS8(env.WORKER_PRIVATE_KEY, 'ES256');
            const signedJwtResponse = await new SignJWT(responseData)
                .setProtectedHeader({ alg: 'ES256' })
                .sign(workerPrivateKey);
            
            // 5. 将签好名的 JWT 作为最终结果返回
            return jsonResponse({ responseToken: signedJwtResponse });

        } catch (error: any) {
            // 如果 jwtVerify 失败 (签名无效)，也会在这里捕获
            const reason = error.code || error.message || 'Internal Server Error';
            console.error(`Validation failed: ${reason}`);
            return jsonResponse({ isValid: false, reason });
        }
    },
};

function jsonResponse(data: object, status: number = 200): Response {
    return new Response(JSON.stringify(data), { status: status, headers: { 'Content-Type': 'application/json' }});
}
```

最后，运行 `npx wrangler deploy` 将其部署到全球。

### 第四部分：消费者 - 安卓 App 的安全核心

在安卓端，我们需要一个 `SecurityManager` 来处理所有复杂的网络和加密操作。

1.  **添加依赖**: 在 `build.gradle` 中添加 `implementation 'com.nimbusds:nimbus-jose-jwt:9.31'` 用于处理 JWT。

2.  **创建 `SecurityManager.java`**

```java
// SecurityManager.java (完整最终版)
import android.util.Base64;
import android.util.Log;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.ECDSAVerifier;
import com.nimbusds.jwt.SignedJWT;
import org.json.JSONObject;
import java.io.BufferedReader;
// ...其他必要的 import...
import java.security.interfaces.ECPublicKey;

public class SecurityManager {
    private static final String TAG = "SecurityManagerDebug";

    // 【部署】将 worker_public_key.pem 的全部内容粘贴到这里
    private static final String WORKER_PUBLIC_KEY_STRING = "-----BEGIN PUBLIC KEY-----\n" +
            "YOUR_WORKER_PUBLIC_KEY_CONTENT_HERE\n" +
            "-----END PUBLIC KEY-----";

    private static boolean verifyResponse(String responseToken) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(responseToken);
            PublicKey publicKey = loadPublicKey(WORKER_PUBLIC_KEY_STRING);
            JWSVerifier verifier = new ECDSAVerifier((ECPublicKey) publicKey);
            return signedJWT.verify(verifier);
        } catch (Exception e) {
            Log.e(TAG, "Exception during JWT verification", e);
            return false;
        }
    }
    
    public static boolean validateLicense(String deviceId, String goldenToken) {
        String workerUrl = "https://your-worker.your-domain.workers.dev"; // 【部署】你的 Worker URL
        Log.d(TAG, "\n--- Starting License Validation ---");
        
        try {
            // ... (省略网络请求的 boilerplate 代码, 参见前文)
            // ... (发送包含 deviceId 和 goldenToken 的 POST 请求)

            // 成功收到 200 OK 响应后
            String rawResponse = ...; // 从 InputStream 读取响应体
            JSONObject jsonResponse = new JSONObject(rawResponse);
            
            if (jsonResponse.has("isValid") && !jsonResponse.getBoolean("isValid")) {
                Log.e(TAG, "Worker returned a validation failure: " + jsonResponse.optString("reason"));
                return false;
            }

            if (!jsonResponse.has("responseToken")) {
                Log.e(TAG, "Response does not contain 'responseToken'");
                return false;
            }
            String responseToken = jsonResponse.getString("responseToken");

            // 1. 验证 Worker 回执的签名
            if (!verifyResponse(responseToken)) {
                return false; // 签名无效，是伪造的响应！
            }

            // 2. 签名有效，可以信任 Payload 的内容
            SignedJWT signedJWT = SignedJWT.parse(responseToken);
            JSONObject payload = new JSONObject(signedJWT.getPayload().toString());
            boolean isLicenseValid = payload.getBoolean("isValid");
            Log.d(TAG, "Is license valid according to TRUSTED payload? -> " + isLicenseValid);
            
            return isLicenseValid;
        } catch (Exception e) {
            Log.e(TAG, "An exception occurred during validation", e);
            return false;
        } 
    }

    // 辅助方法: loadPublicKey...
    // ...
}
```

3.  **UI 集成**
    在您的 `showLicenseActivationDialog` 中，获取用户输入的 `token`，然后在**后台线程**调用 `SecurityManager.validateLicense(deviceId, token)`，并根据返回的布尔值更新 UI（提示成功或失败）。

### 第五部分：从深渊中学习 - 我们的调试之旅

在构建这个系统的过程中，我们遇到了几个经典的、足以让开发者抓狂的“陷阱”。在此分享，希望你能避开：
1.  **致命错误：密钥不匹配**
    *   **症状**：Worker 反复返回 `Invalid token signature`。
    *   **根源**：本地签发令牌的**私钥**，与部署到云端的**公钥**，不是一对。这通常发生在多次生成密钥，导致文件混淆或复制粘贴出错。
    *   **解决方案**：建立一个严格的“信任重建”流程——彻底删除云端和本地的旧密钥，重新生成唯一的一对，然后用**非交互式命令行**进行精确部署。这个流程我们走了两遍，分别解决了客户端到服务端、服务端到客户端的信任问题。

2.  **致命错误：签名/验签内容不一致**
    *   **症状**：两端都声称自己的密钥是正确的，但验签依然失败。
    *   **根源**：服务端签名的是一个完整的 **JWS 结构**，而客户端却在尝试用**原始的 JSON 数据**去验证它。
    *   **解决方案**：统一标准。我们最终决定让两端都完全遵循 JWS/JWT 规范，服务端返回一个单一的 `responseToken`，客户端引入 `nimbus-jose-jwt` 库来进行标准化的解析和验证，问题迎刃而解。

3.  **环境陷阱：TTY 初始化失败**
    *   **症状**：在 Windows 的 Git Bash 中运行 `wrangler` 交互式命令时，直接崩溃。
    *   **根源**：Node.js 的 TTY 实现在某些模拟终端（如 MINGW64）上存在兼容性问题。
    *   **解决方案**：切换到 Windows **原生的 PowerShell** 或 `cmd.exe` 来执行所有 `wrangler` 命令。

### 结论

我们成功构建了一个看似复杂，但逻辑上极其优雅的授权系统。它的安全性不依赖于数据库的存取，而是建立在牢不可破的非对称加密的数学原理之上。通过 Cloudflare Workers，它能以极低的延迟和几乎为零的成本，服务于全球的用户。

这趟旅程充满了挑战，但每一个解决掉的 Bug 都加深了我们对系统安全性的理解。希望这篇完整的指南，能帮助你为自己的应用构建起第一道坚固的防线。