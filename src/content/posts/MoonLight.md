---
title: MoonLight
published: 2025-08-20
description: MoonLight项目笔记
tags:
  - 技术
  - 思考
category: MoonLight
draft: false
---
从这里开始，将讲解Moonlight的相关内容了，这是一篇引导页面
这里解释了整个项目工作流程

[应用启动]
  |
  v
[MainActivity.onCreate()]
  - Inflate binding & setContentView
  - 设置调试按钮 (debugPanelButton) → 监听点击 → showDebugOptionsDialog() → 测试各种对话框 (e.g., Force Update, Package Lock)
  - 设置导航 (NavController)
  |
  v
[DialogLauncher.Thrym(activity)]
  - 调用 Moonlight.init(activity, domesticUrl, internationalUrl)
  |
  v
[Moonlight.init()]
  - 检查 activity 是否有效 (null/finishing → 返回)
  - 获取 SharedPreferences (prefs)
  - 检查并缓存屏幕类型 (peizhi.checkAndCacheScreenType) → 更新 _is_large_screen_
  - 应用背景模糊 (changku.applyBackgroundBlur, 如果启用)
  - 解析颜色 (changku.resolveColors) → 更新 _current_text_color_ 等
  - 加载缓存配置 (wenbenpeizi.loadAllCachedSettings(prefs))
  - 检查互联网连接 (lianjiejiance.CheckInternetTask)
    |
    +-- 是 (有网络) → 加载新配置 (Moonlight.LoadConfigTask)
    |     - 优先级: 用户自定义URL → 强制国内/国际 → 默认国内/国际
    |     - fetchConfig(url) → HTTP GET (带User-Agent, 超时 _config_load_timeout_ms_)
    |     - 验证内容 (JSON or 自定义标签如〈配置版本〉)
    |     - 成功 → 解析配置 (Moonlight.parseConfigContent)
    |         - JSON: JSONObject.getString()
    |         - 自定义: peizhi.extractContentBetweenMarkers()
    |         - 更新 sharezhifu 变量 (e.g., _force_upd_content_, _pkg_ver_cfg_)
    |         - 保存到 prefs (Moonlight.saveConfigToPrefs, 加密 obfuscate)
    |         - 检查语法 (如果 _enable_config_syntax_check_ → QQstart.validateConfigContent)
    |     - 失败 → 使用缓存配置 (wenbenpeizi.loadAllCachedSettings)
    |
    +-- 否 (无网络) → 使用缓存配置 或 显示初始离线对话框 (QQstart.showInitialOfflineDialog)
          - 内容: "首次启动需要网络连接" → "确定并退出" → Moonlight.cleanupBeforeExit() → activity.finish()
  |
  v
[验证与检查阶段] (顺序: 签名 → 包锁定 → 设备ID → 卡密 → 强制更新 → 正常弹窗)
  - 签名验证 (changku.verifyAppSignature, 如果 _enable_sig_ver_)
    +-- 失败 → 显示签名失败对话框 (DialogLiQiuting.showSignatureFailureDialog)
          - 内容: "签名验证失败" → "退出" → 清理 & finish
    +-- 成功 → 继续
  |
  - 包名锁定检查 (如果 _pkg_lock_map_.contains(pkgName))
    +-- 锁定 → 显示包锁定对话框 (DialogLiQiuting.showPackageLockedDialog)
          - 内容: _pkg_lock_content_ → "更新" (打开 _pkg_lock_link_) 或 "关闭/退出"
    +-- 未锁定 → 继续
  |
  - 设备ID检查 (如果 _enable_dev_id_check_)
    +-- ID 不允许 (_allowed_dev_ids_ 不含当前ID) → 显示设备ID限制对话框 (DialogLiQiuting.showDeviceIdRestrictedDialog)
          - 内容: "设备ID受限" → "获取卡密" (打开 _dev_id_card_link_) 或 "退出"
          - 支持倒计时 (如果启用)
    +-- 允许 → 继续
  |
  - 卡密输入检查 (如果 _enable_dev_card_key_check_)
    +-- 需要输入 → 显示卡密输入对话框 (DialogLiQiuting.showCardKeyInputDialog)
          - EditText 输入 → 验证 (_dev_card_keys_.contains(输入))
          - 成功 → 绑定 & 保存 (_PREF_X_ + deviceId)
          - 失败 → 倒计时重试 或 退出
    +-- 已绑定 → 继续
  |
  - 强制更新检查 (QQstart.checkAppVersionForForceUpdate, 如果 _pkg_ver_cfg_.contains(pkgName) && 当前版本 < 要求版本)
    +-- 需要 → _force_upd_req_ = true → 显示强制更新对话框 (DialogLiQiuting.showForceUpdateDialog)
          - 内容: _force_upd_content_ → "立即更新" (打开 _force_upd_link_) 或 "关闭/退出"
          - 支持更新日志 (_upd_log_)
    +-- 无需 → 继续
  |
  - 正常弹窗显示 (如果 _enable_norm_popup_ && _pkg_popup_control_.get(pkgName) == true)
    +-- 显示 → DialogLiQiuting.showMainDialog()
          - 自适应布局 (横/竖屏, 大/小屏)
          - 内容: _dyn_content_ (动态) 或 "欢迎使用"
          - 按钮: "关闭" / "加入TG" / "加入QQ群" / "不再提示" (支持倒计时)
          - 支持中立按钮 (_show_neutral_btn_, e.g., 打开网站/QQ)
    +-- 不显示 → 结束
  |
  v
[远程通知] (如果 _enable_remote_notif_)
  - 发送通知 (changku.sendNotification) → 内容: _remote_notif_content_
  |
  v
[交互与清理]
  - 对话框关闭 (onDismiss) → Moonlight.dismissAndCleanupAllDialogs()
    - 移除模糊 (changku.removeBackgroundBlur)
    - 清理 _s_main_dialog_ / _current_dialog_type_
    - 振动/动画 (peizhi.animateDialogDismiss)
  - 调试模式: showDebugOptionsDialog() → 选择测试类型 → 修改 sharezhifu 变量 → 显示对应对话框 → 恢复备份 (restoreShareZhiFuFields)
  |
  v
[结束/异常路径]
  - 任何失败 (e.g., 配置无效、网络超时) → 使用默认配置 或 退出
  - 清理: Moonlight.cleanupBeforeExit() → 移除模糊 & finish