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
我们构建一个**仅仅依靠算法和签名**的**无状态 (stateless)** 授权系统，是安全领域的经典模式。这种模式的优点是服务器端极其轻量，无需数据库，从而极大地降低了运维成本和被攻击的风险。

基于**非对称加密**和**数字签名**的高安全性授权方案。

### 核心设计思想：信任链与“黄金令牌”

我们将不直接验证设备ID，而是验证一个由**亲自签发的、不可伪造的**Token。这个令牌本身就包含了授权信息。

*   管理员: 拥有**管理员私钥**。你的职责是签发
*   **Cloudflare Worker (验证者)**: 拥有**管理员公钥**和自己的**Worker私钥**。它的职责是：
    1.  验证“黄金令牌”是否由管理员签发。
    2.  验证令牌内的信息（设备ID、过期时间）是否与当前请求匹配。
    3.  用自己的私钥签名，向App证明自己的身份。
*   **安卓应用 (请求者)**: 拥有**Worker公钥**。它的职责是：
    1.  向Worker提交“黄金令牌”进行验证。
    2.  验证Worker的响应是否真实可信。

---

### 第 1 步：密钥的生成与部署

**操作方式（使用 Node.js）:**

1. **安装 jose 库**: 在您的电脑上打开终端，运行 npm install jose。
    
2. **创建 generate-keys.js 文件**:
    
    codeJavaScript
    
    ````
    // generate-keys.js
    import { generateKeyPair } from 'jose';
    import { promises as fs } from 'fs';
    
    async function generateAdminKeys() {
        const { publicKey, privateKey } = await generateKeyPair('ES256');
    
        const spkiPem = await exportSPKI(publicKey);
        const pkcs8Pem = await exportPKCS8(privateKey);
    
        await fs.writeFile('admin_public_key.pem', spkiPem);
        await fs.writeFile('admin_private_key.pem', pkcs8Pem);
    
        console.log('管理员密钥对已生成！');
        console.log('--- admin_public_key.pem (部署到 Cloudflare Worker) ---');
        console.log(spkiPem);
    }
    
    // Node.js 16+ needs these functions for PEM export
    import { createPublicKey, createPrivateKey } from 'crypto';
    function exportSPKI(key) {
        return createPublicKey(key).export({ type: 'spki', format: 'pem' });
    }
    function exportPKCS8(key) {
        return createPrivateKey(key).export({ type: 'pkcs8', format: 'pem' });
    }
    
    generateAdminKeys();
    ```3.  **运行脚本**: 在终端中运行 `node generate-keys.js`。
    ````
    

**结果**：

- 您会得到两个文件：admin_public_key.pem 和 admin_private_key.pem。
    
- admin_private_key.pem: **这是您的“传国玉玺”，绝对不能泄露！**
    
- admin_public_key.pem: 这是“照妖镜”，您需要把它部署到 Cloudflare Worker 的环境变量 ADMIN_PUBLIC_KEY 中。
    

(同样的方法，您也需要生成一对 worker_..._key.pem 并部署好。)

你需要两对密钥（公钥+私钥）。可以使用 OpenSSL 或在线工具生成 **ECDSA P-256** 密钥对。

1.  **管理员密钥对**:
    *   `admin_private_key.pem`: **绝密！** 仅由您在签发“黄金令牌”时使用。
    *   `admin_public_key.pem`: 部署到 Cloudflare Worker 的环境变量中，用于验证令牌。

2.  **Worker 密钥对**:
    *   `worker_private_key.pem`: 部署到 Cloudflare Worker 的**环境变量（Secret）**中，用于签名响应。
    *   `worker_public_key.pem`: **硬编码**到您的安卓应用中，用于验证 Worker 的响应。
### 第 2 步：制作并签发“卡密”（管理员操作）

这是您日常需要进行的操作，比如当一个用户付费后，您需要为他生成一张“天卡”或“月卡”。

**操作方式（创建一个 issue-token.js 脚本）:**

1. **创建 issue-token.js 文件**:
    
    codeJavaScript
    
    ```
    // issue-token.js
    import { SignJWT, importPKCS8 } from 'jose';
    import { promises as fs } from 'fs';
    import { createPrivateKey } from 'crypto';
    
    async function issueGoldenToken(deviceId, validityInDays) {
        // 1. 从文件中读取您的私钥
        const privateKeyPem = await fs.readFile('admin_private_key.pem', 'utf-8');
        const privateKey = await importPKCS8(privateKeyPem, 'ES256');
    
        // 2. 计算过期时间戳 (从现在开始 + 有效天数)
        const expiresAt = Math.floor(Date.now() / 1000) + (validityInDays * 24 * 60 * 60);
    
        // 3. 创建 Payload
        const payload = {
            deviceId: deviceId,
            expiresAt: expiresAt,
        };
    
        // 4. 使用 JWS 进行签名
        const goldenToken = await new SignJWT(payload)
            .setProtectedHeader({ alg: 'ES256' })
            .sign(privateKey);
    
        console.log('--- 黄金令牌 (卡密) 已生成 ---');
        console.log(`设备ID: ${deviceId}`);
        console.log(`有效期至: ${new Date(expiresAt * 1000).toLocaleString()}`);
        console.log('请将下面的字符串发给用户:');
        console.log(goldenToken);
    }
    
    // --- 使用示例 ---
    const userDeviceId = process.argv[2]; // 从命令行获取设备ID
    const days = parseInt(process.argv[3], 10); // 从命令行获取有效天数
    
    if (!userDeviceId || !days) {
        console.log('用法: node issue-token.js <设备ID> <有效天数>');
        console.log('例如: node issue-token.js ABCDEF123456 30');
    } else {
        issueGoldenToken(userDeviceId, days);
    }
    ```
---

### 第 2 步：签发“黄金令牌” (管理员操作)

您需要一个简单的脚本（可以是Node.js, Python等）或一个简单的后台页面来执行此操作。

**输入**:
*   用户的设备ID (例如: `ABCDEF123456`)
*   授权过期时间戳 (例如: `1767225600` - 2026年1月1日)

**操作**:
1.  创建一个 JSON 对象: `{"deviceId": "ABCDEF123456", "expiresAt": 1767225600}`
2.  使用您的 **`admin_private_key.pem`** 对这个 JSON 字符串进行签名 (例如使用 JWS - JSON Web Signature 标准)。
3.  **输出 (黄金令牌)**: `[Header].[Payload].[Signature]` 格式的 JWS 字符串。
    例如: `eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXZpY2VJZCI6IkFCQ0RFRjEyMzQ1NiIsImV4cGlyZXNBdCI6MTc2NzIyNTYwMH0.signature_part`

这个“黄金令牌”就是您发给用户的卡密。

---

### 第 3 步：安卓端的改造

我们将创建一个 `SecurityManager` 来处理所有加密和网络逻辑，并改造您的对话框。

#### 3.1 `SecurityManager.java` (新文件)

这个类是安全核心，负责签名、加密和网络请求。

```java
// SecurityManager.java
import android.util.Base64;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.Signature;
import java.security.spec.X509EncodedKeySpec;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.json.JSONObject;

public class SecurityManager {
    // 【部署】将你的 worker_public_key.pem 内容转换为一行字符串，硬编码在这里
    private static final String WORKER_PUBLIC_KEY_STRING = "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...\n-----END PUBLIC KEY-----";

    // 验证来自 Cloudflare Worker 的响应
    private static boolean verifyResponse(String jsonData, String signatureB64) throws Exception {
        // ... (实现 ECDSA 签名验证)
        PublicKey publicKey = loadPublicKey(WORKER_PUBLIC_KEY_STRING);
        Signature ecdsaVerify = Signature.getInstance("SHA256withECDSA");
        ecdsaVerify.initVerify(publicKey);
        ecdsaVerify.update(jsonData.getBytes(StandardCharsets.UTF_8));
        return ecdsaVerify.verify(Base64.decode(signatureB64, Base64.DEFAULT));
    }

    // 发起验证请求
    public static boolean validateLicense(String deviceId, String goldenToken) {
        try {
            URL url = new URL("https://your-worker.your-domain.workers.dev"); // 【部署】你的 Worker 地址
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json; utf-8");
            conn.setDoOutput(true);

            // 1. 创建请求体
            JSONObject requestPayload = new JSONObject();
            requestPayload.put("deviceId", deviceId);
            requestPayload.put("token", goldenToken);
            requestPayload.put("timestamp", System.currentTimeMillis());

            // 【高安全性】可以使用混合加密进一步保护请求，这里为简化省略

            // 2. 发送请求
            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = requestPayload.toString().getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }

            // 3. 读取响应
            try (BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                StringBuilder response = new StringBuilder();
                String responseLine;
                while ((responseLine = br.readLine()) != null) {
                    response.append(responseLine.trim());
                }
                
                // 4. 解析并验证响应
                JSONObject jsonResponse = new JSONObject(response.toString());
                String responseData = jsonResponse.getJSONObject("data").toString();
                String signature = jsonResponse.getString("signature");

                if (!verifyResponse(responseData, signature)) {
                    // 签名验证失败，Worker 是伪造的！
                    return false;
                }

                JSONObject data = new JSONObject(responseData);
                return data.getBoolean("isValid");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
    
    // 辅助方法，加载公钥
    private static PublicKey loadPublicKey(String key) throws Exception {
        String publicKeyPEM = key
          .replace("-----BEGIN PUBLIC KEY-----", "")
          .replaceAll(System.lineSeparator(), "")
          .replace("-----END PUBLIC KEY-----", "");
        byte[] encoded = Base64.decode(publicKeyPEM, Base64.DEFAULT);
        KeyFactory keyFactory = KeyFactory.getInstance("EC");
        X509EncodedKeySpec keySpec = new X509EncodedKeySpec(encoded);
        return keyFactory.generatePublic(keySpec);
    }
}
```

#### 3.2 改造 `showCardKeyInputDialog`

我们将 `showCardKeyInputDialog` 变成一个真正的授权激活对话框。

```java
// 在 DialogLiQiuting.java 中

public static void showLicenseActivationDialog(final Activity activity) {
    Moonlight.dismissAndCleanupAllDialogs();
    if (activity == null || activity.isFinishing()) return;

    final boolean isChinese = LiConfiguration.isChinese(activity);
    final String currentDeviceId = Moonlight.getDeviceId(activity);
    
    LinearLayout customLayout = new LinearLayout(activity);
    customLayout.setOrientation(LinearLayout.VERTICAL);
    
    final EditText licenseInput = new EditText(activity);
    licenseInput.setHint(isChinese ? "请输入授权令牌" : "Enter License Token");
    // ... setupEditTextStyle ...
    
    customLayout.addView(licenseInput);
    
    // 显示设备ID的文本
    String deviceIdText = (isChinese ? "您的设备码: " : "Your Device ID: ") + currentDeviceId;

    new DialogBuilder(activity)
            .setTitle(isChinese ? "应用授权" : "Application License")
            .setContent(deviceIdText)
            .setCustomContent(customLayout)
            .addButton(isChinese ? "激活授权" : "Activate License", v -> {
                String token = licenseInput.getText().toString().trim();
                if (token.isEmpty()) {
                    ShitFuckStaticClass.showToast(activity, isChinese ? "令牌不能为空" : "Token cannot be empty");
                    return;
                }
                
                // 【核心调用】
                // 在后台线程执行网络请求
                new Thread(() -> {
                    final boolean isValid = SecurityManager.validateLicense(currentDeviceId, token);
                    activity.runOnUiThread(() -> {
                        if (isValid) {
                            // 验证成功！保存令牌和状态，然后关闭对话框
                            SharedPreferences prefs = ShitFuckStaticClass.getSharedPreferences(activity);
                            prefs.edit().putString("golden_token", token).putBoolean("is_licensed", true).apply();
                            ShitFuckStaticClass.showToast(activity, isChinese ? "授权成功！" : "License activated successfully!");
                            if (StaticFuck._s_main_dialog_ != null) LiConfiguration.animateDialogDismiss(StaticFuck._s_main_dialog_);
                        } else {
                            // 验证失败
                            ShitFuckStaticClass.showToast(activity, isChinese ? "授权失败，请检查令牌或联系管理员" : "Activation failed. Check token or contact admin.");
                        }
                    });
                }).start();
            })
            .addButton(isChinese ? "复制设备码" : "Copy Device ID", v -> ShitFuckStaticClass.copyDeviceId(activity, currentDeviceId))
            .addButton(isChinese ? "退出" : "Exit", v -> activity.finish())
            .show();
}
```

---

### 第 4 步：Cloudflare Worker (`index.js`)

这是无服务器后台的核心。它需要一个 JOSE (JSON Object Signing and Encryption) 库来处理签名。`jose` 是一个很好的选择。

```javascript
// index.js for Cloudflare Worker
import { importSPKI, jwtVerify, SignJWT } from 'jose';

// 【部署】在 Worker 的环境变量中设置这些 Secret
// ADMIN_PUBLIC_KEY: 你的 admin_public_key.pem 内容
// WORKER_PRIVATE_KEY: 你的 worker_private_key.pem 内容

export default {
    async fetch(request, env, ctx) {
        if (request.method !== 'POST') {
            return new Response('Expected POST', { status: 405 });
        }

        try {
            const body = await request.json();
            const { deviceId, token, timestamp } = body;

            // --- 1. 验证请求的基本有效性 ---
            if (!deviceId || !token || !timestamp) {
                return jsonResponse({ error: 'Missing parameters' }, 400);
            }
            // 防重放攻击：拒绝5分钟前的请求
            if (Date.now() - timestamp > 300000) {
                return jsonResponse({ error: 'Request expired' }, 400);
            }
            
            // --- 2. 验证“黄金令牌” ---
            const adminPublicKey = await importSPKI(env.ADMIN_PUBLIC_KEY, 'ES256');
            let tokenPayload;
            try {
                const { payload } = await jwtVerify(token, adminPublicKey);
                tokenPayload = payload;
            } catch (err) {
                // 令牌签名无效，是伪造的！
                return jsonResponse({ isValid: false, reason: 'Invalid token signature' });
            }

            // --- 3. 核心逻辑校验 ---
            // 检查设备ID是否匹配
            if (tokenPayload.deviceId !== deviceId) {
                return jsonResponse({ isValid: false, reason: 'Device ID mismatch' });
            }
            // 检查是否过期
            if (Date.now() / 1000 > tokenPayload.expiresAt) {
                return jsonResponse({ isValid: false, reason: 'Token expired' });
            }

            // --- 4. 所有验证通过，准备成功响应 ---
            const responseData = {
                isValid: true,
                deviceId: tokenPayload.deviceId,
                expiresAt: tokenPayload.expiresAt,
                validatedAt: Math.floor(Date.now() / 1000),
            };

            // --- 5. 签名响应，证明 Worker 身份 ---
            const workerPrivateKey = await importPKCS8(env.WORKER_PRIVATE_KEY, 'ES256');
            const signature = await new SignJWT(responseData)
                .setProtectedHeader({ alg: 'ES256' })
                .sign(workerPrivateKey);

            return jsonResponse({
                data: responseData,
                signature: signature,
            });

        } catch (error) {
            return jsonResponse({ error: 'Internal Server Error' }, 500);
        }
    },
};

function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status: status,
        headers: { 'Content-Type': 'application/json' },
    });
}
```
*(注意: Cloudflare Worker 中使用 `jose` 可能需要配置构建步骤，或使用支持 Web Crypto API 的版本)*

---

### 高安全性与防破解总结

1.  **防篡改**: 请求和响应都通过数字签名保护。任何中间人修改都会导致签名验证失败。
2.  **防伪造**:
    *   用户无法自己生成有效的“黄金令牌”，因为它需要管理员的私钥。
    *   App 不会信任伪造的 Worker 响应，因为它需要 Worker 的私钥签名。
3.  **防重放**: 请求中加入了时间戳，Worker 会拒绝过时的请求。
4.  **无状态**: Worker 端不存储任何设备信息，只做算法验证，极大减少了攻击面。
5.  **防静态分析 (App端)**:
    *   使用 ProGuard/R8 对代码进行**强力混淆**。
    *   将 `WORKER_PUBLIC_KEY_STRING` 等密钥字符串**加密存储**，在运行时再解密，或者通过 **NDK (C++)** 存储在 `.so` 文件中，增加逆向难度。
6.  **防动态分析 (App端 - 最高级别)**:
    *   这是最难防御的。攻击者可以使用 Frida 或您开发的 LSPosed 模块来 Hook `SecurityManager.validateLicense` 方法，强行让它返回 `true`。
    *   **对抗措施**：在代码的多个关键点进行**完整性校验**和**交叉验证**。例如，除了 `validateLicense` 返回布尔值外，还可以让它返回一个由服务器签名的**有时效性的 session token**，然后在其他核心功能（比如解密资源）中再次验证这个 session token 的有效性。这会大大增加攻击者的 Hook 成本。同时，加入 Root 检测、调试器检测等手段。

这个方案为您提供了一个非常坚实、专业且高度安全的授权系统框架。

好的，完全理解。去除客户端时间戳校验是正确的做法，因为设备时间完全不可信。我们将把所有的时间校验逻辑都放在 Cloudflare Worker 端，依赖令牌自身的过期时间。

下面，我将为您详细拆解**卡密（即“黄金令牌”）的生成、分发、验证**的完整流程，并提供具体的代码和操作细节。

---

### 核心理念回顾：卡密的本质

在我们的系统中，“卡密”不是一个简单的密码，它是一个**“数字身份证”**，学名叫 **JWS (JSON Web Signature)**。

*   **看得见的部分 (Payload)**：包含了授权的核心信息，是JSON格式的，例如 `{"deviceId": "ABC...", "expiresAt": 17...}`。
*   **看不见的部分 (Signature)**：由您的**管理员私钥**对上述信息进行加密签名后生成的“防伪印章”。
*   **特点**：任何人都可以读取看得见的部分，但**只有拥有管理员公钥的人**才能验证这个“防伪印章”是不是真的。任何对Payload内容的篡改都会导致印章失效。

---

### 第 1 步：生成您的“印章模具”（管理员密钥对）

这是所有安全的基础。您只需要做一次。

**操作方式（使用 Node.js）:**

1.  **安装 `jose` 库**: 在您的电脑上打开终端，运行 `npm install jose`。
2.  **创建 `generate-keys.js` 文件**:
    ```javascript
    // generate-keys.js
    import { generateKeyPair } from 'jose';
    import { promises as fs } from 'fs';

    async function generateAdminKeys() {
        const { publicKey, privateKey } = await generateKeyPair('ES256');

        const spkiPem = await exportSPKI(publicKey);
        const pkcs8Pem = await exportPKCS8(privateKey);

        await fs.writeFile('admin_public_key.pem', spkiPem);
        await fs.writeFile('admin_private_key.pem', pkcs8Pem);

        console.log('管理员密钥对已生成！');
        console.log('--- admin_public_key.pem (部署到 Cloudflare Worker) ---');
        console.log(spkiPem);
    }

    // Node.js 16+ needs these functions for PEM export
    import { createPublicKey, createPrivateKey } from 'crypto';
    function exportSPKI(key) {
        return createPublicKey(key).export({ type: 'spki', format: 'pem' });
    }
    function exportPKCS8(key) {
        return createPrivateKey(key).export({ type: 'pkcs8', format: 'pem' });
    }

    generateAdminKeys();
    ```3.  **运行脚本**: 在终端中运行 `node generate-keys.js`。

**结果**：
*   您会得到两个文件：`admin_public_key.pem` 和 `admin_private_key.pem`。
*   `admin_private_key.pem`: **这是您的“传国玉玺”，绝对不能泄露！**
*   `admin_public_key.pem`: 这是“照妖镜”，您需要把它部署到 Cloudflare Worker 的环境变量 `ADMIN_PUBLIC_KEY` 中。

*(同样的方法，您也需要生成一对 `worker_..._key.pem` 并部署好。)*

---

### 第 2 步：制作并签发“卡密”（管理员操作）

这是您日常需要进行的操作，比如当一个用户付费后，您需要为他生成一张“天卡”或“月卡”。

**操作方式（创建一个 `issue-token.js` 脚本）:**

1.  **创建 `issue-token.js` 文件**:
    ```javascript
    // issue-token.js
    import { SignJWT, importPKCS8 } from 'jose';
    import { promises as fs } from 'fs';
    import { createPrivateKey } from 'crypto';

    async function issueGoldenToken(deviceId, validityInDays) {
        // 1. 从文件中读取您的私钥
        const privateKeyPem = await fs.readFile('admin_private_key.pem', 'utf-8');
        const privateKey = await importPKCS8(privateKeyPem, 'ES256');

        // 2. 计算过期时间戳 (从现在开始 + 有效天数)
        const expiresAt = Math.floor(Date.now() / 1000) + (validityInDays * 24 * 60 * 60);

        // 3. 创建 Payload
        const payload = {
            deviceId: deviceId,
            expiresAt: expiresAt,
        };

        // 4. 使用 JWS 进行签名
        const goldenToken = await new SignJWT(payload)
            .setProtectedHeader({ alg: 'ES256' })
            .sign(privateKey);

        console.log('--- 黄金令牌 (卡密) 已生成 ---');
        console.log(`设备ID: ${deviceId}`);
        console.log(`有效期至: ${new Date(expiresAt * 1000).toLocaleString()}`);
        console.log('请将下面的字符串发给用户:');
        console.log(goldenToken);
    }

    // --- 使用示例 ---
    const userDeviceId = process.argv[2]; // 从命令行获取设备ID
    const days = parseInt(process.argv[3], 10); // 从命令行获取有效天数

    if (!userDeviceId || !days) {
        console.log('用法: node issue-token.js <设备ID> <有效天数>');
        console.log('例如: node issue-token.js ABCDEF123456 30');
    } else {
        issueGoldenToken(userDeviceId, days);
    }
    ```
2.  **如何使用**:
    *   在终端里，运行命令，传入用户的**设备ID**和**有效天数**。
    *   例如，给设备 `ABCDEF123456` 生成一张30天有效的月卡：
        `node issue-token.js ABCDEF123456 30`

**结果**：
脚本会输出一长串字符串，例如 `eyJhbGciOiJFUzI1NiJ9.eyJkZXZpY2VJZCI6IkFCQ0RFRjEyMzQ1NiIsImV4cGlyZXNBdCI6MTc2OTgyNzIwMH0.a_very_long_signature_part`。
**这个字符串，就是您要发给用户的最终“卡密”。**

---

### 第 3 步：安卓应用端的验证流程（用户操作）

用户拿到您发的“卡密”后，会在 `showLicenseActivationDialog` 对话框中输入它。

1.  用户在 `EditText` 中输入卡密，点击“激活授权”。
2.  **`SecurityManager.validateLicense(deviceId, token)`** 方法被调用。
3.  它会向您的 Cloudflare Worker 发送一个 POST 请求，请求体中包含：
    *   `deviceId`: App 从系统中获取的当前设备ID。
    *   `token`: 用户输入的卡密。
4.  然后等待 Worker 的响应。

---

### 第 4 步：Cloudflare Worker 的验证逻辑（无服务器后台）

Worker 收到请求后，执行一系列**无状态**的、纯粹的算法验证。

**`index.js` (移除了客户端时间戳校验的最终版):**

```javascript
import { importSPKI, jwtVerify, SignJWT, importPKCS8 } from 'jose';

export default {
    async fetch(request, env, ctx) {
        if (request.method !== 'POST') {
            return new Response('Expected POST', { status: 405 });
        }

        try {
            const body = await request.json();
            const { deviceId, token } = body;

            // --- 1. 验证请求参数完整性 ---
            if (!deviceId || !token) {
                return jsonResponse({ isValid: false, reason: 'Missing parameters' });
            }
            
            // --- 2. 验证“黄金令牌”的签名 ---
            const adminPublicKey = await importSPKI(env.ADMIN_PUBLIC_KEY, 'ES256');
            let tokenPayload;
            try {
                // 使用 jose 库，拿管理员的公钥（照妖镜）来验证令牌签名
                const { payload } = await jwtVerify(token, adminPublicKey);
                tokenPayload = payload;
            } catch (err) {
                // 如果签名不匹配，jwtVerify会抛出异常
                // 这说明令牌是伪造的，或者被篡改过
                return jsonResponse({ isValid: false, reason: 'Invalid token signature' });
            }

            // --- 3. 验证令牌内容的有效性 ---
            // a. 检查令牌中的设备ID是否与当前请求的设备ID匹配
            if (tokenPayload.deviceId !== deviceId) {
                return jsonResponse({ isValid: false, reason: 'Device ID mismatch' });
            }
            // b. 检查令牌是否已过期（【核心】服务器端时间校验）
            if (Math.floor(Date.now() / 1000) > tokenPayload.expiresAt) {
                return jsonResponse({ isValid: false, reason: 'Token expired' });
            }

            // --- 4. 所有验证通过！---
            const responseData = {
                isValid: true,
                deviceId: tokenPayload.deviceId,
                expiresAt: tokenPayload.expiresAt,
            };

            // --- 5. 用 Worker 自己的私钥签名响应，发回给 App ---
            const workerPrivateKey = await importPKCS8(env.WORKER_PRIVATE_KEY, 'ES256');
            const signature = await new SignJWT({}) // 响应的 payload 可以为空，我们只关心签名
                .setProtectedHeader({ alg: 'ES256' })
                .setSubject(JSON.stringify(responseData)) // 将数据放在 subject 中
                .sign(workerPrivateKey);

            return jsonResponse({
                data: responseData,
                signature: signature,
            });

        } catch (error) {
            console.error(error);
_return jsonResponse({ isValid: false, reason: 'Internal Server Error' });
        }
    },
};

function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status: status,
        headers: { 'Content-Type': 'application/json' },
    });
}
```
*(注意：Worker 端的签名响应方式略有调整，将数据放在了 `subject` 中，这需要安卓端的 `verifyResponse` 做出相应调整来验证)*

### 总结

这个流程实现了完美的闭环：
*   **管理员**：用**私钥**制作“带防伪印章的身份证”（卡密）。
*   **用户**：拿到“身份证”，在 App 里出示。
*   **App**：将“身份证”和自己的“指纹”（设备ID）一起交给“保安”（Worker）。
*   **Worker (保安)**：
    1.  用“照妖镜”（管理员公钥）检查“身份证”上的“印章”是不是真的。
    2.  对比“身份证”上的照片（`tokenPayload.deviceId`）和用户的“指纹”（`request.deviceId`）是否一致。
    3.  检查“身份证”是否过期。
    4.  验证通过后，给 App 一个自己盖了章的回执。
*   **App**：检查“保安”的回执是不是真的，从而确认授权结果。

整个过程，Worker 不需要记住任何设备信息，每一次验证都是一次独立的、纯粹的密码学计算，这正是其高安全性和低成本的根源。

好的，这个错误 `Cannot find module 'jose'` 是一个非常典型的 **Cloudflare Worker / TypeScript / JavaScript 模块解析**问题。

您在本地用 Node.js 成功运行了脚本，但当您把相似的代码部署到 Cloudflare Worker 时，Worker 的运行环境不认识 `import ... from 'jose'` 这种写法。

### 问题的根本原因

Cloudflare Worker 的运行环境与您本地的 Node.js 环境不同。它不包含 `node_modules` 文件夹，也不会自动去 NPM 下载您指定的依赖。您**不能**像在本地一样，仅仅通过 `import` 就期望它能找到 `jose` 这个库。

您必须为 Cloudflare Worker 提供一个**“打包好”**的、**包含了所有依赖代码**的**单一 JavaScript 文件**。这个过程通常通过一个叫做 **`wrangler`** 的命令行工具和一个打包工具（如 `esbuild` 或 `webpack`）来自动完成。

如果您是直接在 Cloudflare 的在线编辑器里粘贴代码，那您需要粘贴的是**最终打包好**的代码，或者使用支持 Web 标准的、无需打包的模块 URL。

---

### 解决方案：使用 Wrangler 和现代化 JavaScript 项目结构

这是最专业、最推荐的解决方案。我们将创建一个标准的 Cloudflare Worker 项目，让 `wrangler` 自动为我们处理打包和部署。

#### 第 1 步：安装 Wrangler

如果您还没安装，请在您的电脑终端中运行：
`npm install -g wrangler`

#### 第 2 步：创建一个新的 Worker 项目

1.  在您的终端中，运行 `wrangler` 的初始化命令：
    `npx wrangler init my-license-worker`
    *(将 `my-license-worker` 替换为您想要的项目名)*

2.  `wrangler` 会询问您几个问题：
    *   "Would you like to use git to manage this Worker?" -> **Yes**
    *   "Would you like to create a `package.json` file?" -> **Yes**
    *   "Would you like to use TypeScript?" -> **Yes** (强烈推荐，可以避免很多错误)
    *   "Which type of Worker would you like to create?" -> 选择 **"Hello World"** 模板。

3.  `wrangler` 会为您创建一个包含所有必需文件的新项目文件夹 `my-license-worker`。

#### 第 3 步：在新项目中安装 `jose` 依赖

1.  进入新创建的项目目录：
    `cd my-license-worker`
2.  使用 `npm` 安装 `jose` 库。这会把它添加到 `package.json` 并下载到 `node_modules` 中，以便 `wrangler` 在打包时能找到它。
    `npm install jose`

#### 第 4 步：编写 Worker 代码

打开新项目中的 `src/index.ts` 文件，然后用我们之前设计的、**完全兼容**这个环境的 Worker 逻辑来替换它的内容。

**`src/index.ts` (最终的、可在 Wrangler 中运行的版本):**

```typescript
// src/index.ts
import { importSPKI, jwtVerify, SignJWT, importPKCS8 } from 'jose';

// 定义环境变量的类型，这是 TypeScript 的一个好习惯
export interface Env {
    ADMIN_PUBLIC_KEY: string;
    WORKER_PRIVATE_KEY: string;
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        if (request.method !== 'POST') {
            return jsonResponse({ error: 'Expected POST' }, 405);
        }

        try {
            const body: { deviceId?: string; token?: string } = await request.json();
            const { deviceId, token } = body;

            if (!deviceId || !token) {
                return jsonResponse({ isValid: false, reason: 'Missing parameters' });
            }

            // 1. 验证“黄金令牌”
            const adminPublicKey = await importSPKI(env.ADMIN_PUBLIC_KEY, 'ES256');
            let tokenPayload: any;
            try {
                const { payload } = await jwtVerify(token, adminPublicKey);
                tokenPayload = payload;
            } catch (err) {
                return jsonResponse({ isValid: false, reason: 'Invalid token signature' });
            }

            // 2. 核心逻辑校验
            if (tokenPayload.deviceId !== deviceId) {
                return jsonResponse({ isValid: false, reason: 'Device ID mismatch' });
            }
            if (Math.floor(Date.now() / 1000) > tokenPayload.expiresAt) {
                return jsonResponse({ isValid: false, reason: 'Token expired' });
            }

            // 3. 所有验证通过，准备成功响应
            const responseData = {
                isValid: true,
                deviceId: tokenPayload.deviceId,
                expiresAt: tokenPayload.expiresAt,
            };

            // 4. 签名响应
            const workerPrivateKey = await importPKCS8(env.WORKER_PRIVATE_KEY, 'ES256');
            const signature = await new SignJWT({})
                .setProtectedHeader({ alg: 'ES256' })
                .setSubject(JSON.stringify(responseData)) // 将数据放在 subject 中
                .sign(workerPrivateKey);
            
            return jsonResponse({
                data: responseData,
                signature: signature,
            });

        } catch (error) {
            console.error(error);
            return jsonResponse({ isValid: false, reason: 'Internal Server Error' });
        }
    },
};

function jsonResponse(data: object, status: number = 200): Response {
    return new Response(JSON.stringify(data), {
        status: status,
        headers: { 'Content-Type': 'application/json' },
    });
}
```

#### 第 5 步：配置并部署

1.  **登录 Wrangler**：
    `npx wrangler login`
    *(这会打开浏览器让您登录 Cloudflare 账户)*

2.  **配置环境变量 (Secrets)**：
    在部署**之前**，我们需要把密钥安全地上传到 Cloudflare。**不要**把密钥写在代码里。

    *   **上传管理员公钥**：在终端中运行（从 `my-license-worker` 目录）：
        `npx wrangler secret put ADMIN_PUBLIC_KEY`
        然后把您的 `admin_public_key.pem` 文件的**全部内容**粘贴进去，按 `Ctrl+D` (或 `Ctrl+Z` on Windows) 保存。

    *   **上传 Worker 私钥**：
        `npx wrangler secret put WORKER_PRIVATE_KEY`
        然后把您的 `worker_private_key.pem` 文件的**全部内容**粘贴进去。

3.  **部署！**
    最后，运行部署命令：
    `npx wrangler deploy`

`wrangler` 现在会自动执行以下操作：
*   读取 `src/index.ts`。
*   找到 `import { ... } from 'jose'`。
*   进入 `node_modules` 文件夹，把 `jose` 库的所有代码和您自己的代码**打包**成一个 `_worker.js` 文件。
*   将这个打包好的文件上传并部署到 Cloudflare。

部署成功后，`wrangler` 会告诉您 Worker 的公开 URL。您的安卓应用现在就可以向这个 URL 发起请求了。

### 总结

您遇到的 `Cannot find module 'jose'` 错误，是因为您试图在 Cloudflare 的环境中直接运行未经处理的、带有 NPM 模块导入的代码。

**正确的做法是**：
1.  使用官方的 `wrangler` 工具创建一个标准项目。
2.  使用 `npm install jose` 来管理依赖。
3.  将您的逻辑写入 `src/index.ts`。
4.  使用 `wrangler secret put` 来安全地配置密钥。
5.  运行 `wrangler deploy`，让工具自动完成**打包和部署**的所有工作。
6. #### 放弃当前操作，使用非交互式模式

交互式粘贴容易出错（比如少复制一行）。使用我们之前讨论过的、通过管道符的非交互式模式，是更专业、更可靠的做法。

1. **退出当前命令**：
    
    - 在那个“卡住”的终端窗口，按下 **Ctrl + C** 来强制终止当前正在运行的 wrangler 命令。您会回到正常的命令行提示符。
        
2. **使用管道符重新执行命令**：
    
    - 确保您当前所在的目录是 D:\FlyCursor\my-license-worker\。
        
    - 确保您的密钥文件在 D:\FlyCursor\ 目录下。
        
    - 在 PowerShell 终端中，执行以下命令：
        
    
    codePowershell
    
    ```
    # 上传 Worker 私钥 (非交互式)
    Get-Content ..\worker_private_key.pem | npx wrangler secret put WORKER_PRIVATE_KEY
    
    # 上传管理员公钥 (非交互式)
    Get-Content ..\admin_public_key.pem | npx wrangler secret put ADMIN_PUBLIC_KEY
    ```
    
    ( ..\ 表示返回上一级目录，即从 my-license-worker 返回到 FlyCursor)

**请使用下面的命令，这才是 Git Bash 环境下正确的非交互式操作：**

codeBash

```
# 在 Git Bash (MINGW64) 终端中

# 重新上传（或验证）Worker 私钥
cat ../worker_private_key.pem | npx wrangler secret put WORKER_PRIVATE_KEY

# 重新上传（或验证）管理员公钥
cat ../admin_public_key.pem | npx wrangler secret put ADMIN_PUBLIC_KEY
```