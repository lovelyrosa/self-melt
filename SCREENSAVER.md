# 把 Self-Melt 做成 Mac 屏保

macOS 不能直接把网页设为屏保，需要一个 **WebView 屏保插件** 来加载页面。

推荐工具：**WebViewScreenSaver**（免费、开源）

---

## 方法 A：加载在线版（最简单）

适合：已推送到 GitHub Pages，电脑能上网。

### 1. 安装 WebViewScreenSaver

1. 打开发布页：  
   https://github.com/liquidx/webviewscreensaver/releases  
2. 下载最新的 **`.saver.zip`** / **`.saver`**
3. 双击 `WebViewScreenSaver.saver`
4. 系统弹出提示时选 **安装**（Install）
5. 若被拦截：**系统设置 → 隐私与安全性 → 仍要打开**

安装位置一般是：

```text
~/Library/Screen Savers/WebViewScreenSaver.saver
```

### 2. 设为屏保并填网址

1. **系统设置 → 锁定屏幕 / 屏保**（Screen Saver）
2. 选择 **WebViewScreenSaver**（或 “Web View”）
3. 点 **选项 / Options…**
4. URL 填：

```text
https://lovelyrosa.github.io/self-melt/?screensaver=1
```

`?screensaver=1` 会隐藏操作说明 HUD，更适合屏保。

5. 预览一下，确认有动画
6. 设置「开始屏保」的空闲时间

### 3. 测试

```bash
# 立即启动当前屏保（退出：动鼠标）
open -a ScreenSaverEngine
```

或在屏保设置里点预览。

---

## 方法 B：离线本地文件（不依赖网络）

项目里已生成单文件：

```text
~/self-melt/screensaver.html
```

内嵌了 CSS + JS + 源码，可直接 `file://` 打开。

### 1. 固定到一个稳定路径（可选）

```bash
mkdir -p ~/Library/Screen\ Savers/SelfMelt
cp ~/self-melt/screensaver.html ~/Library/Screen\ Savers/SelfMelt/
```

### 2. 在 WebViewScreenSaver 里填本地 URL

格式必须是 **file://** 绝对路径，注意空格要写成 `%20`：

```text
file:///Users/rqin/Library/Screen%20Savers/SelfMelt/screensaver.html
```

把 `rqin` 换成你的用户名（终端可运行 `echo $HOME` 查看）。

或用这条命令生成：

```bash
python3 - <<'PY'
from pathlib import Path
p = Path.home() / "Library/Screen Savers/SelfMelt/screensaver.html"
print(p.resolve().as_uri())
PY
```

把打印出来的 `file:///...` 整行粘贴到屏保 URL。

### 3. 先用浏览器验证

```bash
open ~/self-melt/screensaver.html
```

应全屏感的黑底 + 融化源码（无右侧 HUD）。

---

## 方法 C：不想装第三方插件

macOS **没有**官方「用网页当屏保」入口。替代方案：

| 方案 | 说明 |
|------|------|
| **网页当桌面** | [Plash](https://github.com/sindresorhus/Plash) 等 → 壁纸层，不是锁屏屏保 |
| **导出视频再当屏保** | 录一段 Self-Melt → 用系统「随机」或第三方视频屏保（失去实时生成） |
| **自己写 .saver** | Xcode + ScreenSaver.framework + WKWebView，要签名，成本高 |

日常用 **方法 A 或 B + WebViewScreenSaver** 即可。

---

## 常见问题

### 屏保是黑屏

- 检查 URL 是否可在 Safari 打开  
- 本地 `file://` 路径是否完整、用户名是否对  
- 更新代码后重新 `cp` 到 `Screen Savers/SelfMelt/`  
- 系统设置里重新选一次该屏保  

### 提示来自未识别的开发者

**系统设置 → 隐私与安全性 → 仍要打开**，或：

```bash
xattr -dr com.apple.quarantine ~/Library/Screen\ Savers/WebViewScreenSaver.saver
```

### 多显示器

WebViewScreenSaver 通常每个屏幕各开一个 WebView；若只有一块有画面，在 Options 里看是否有 “Display” 相关选项。

### 想换配色

在线版改 URL 参数（若以后加了 query），或本地改 `main.js` 默认 `paletteIdx` 后重新生成：

```bash
cd ~/self-melt
python3 scripts/build-screensaver.py   # 若已添加脚本
# 或再跑 README 里的生成命令，然后 cp 覆盖
```

### 改了代码如何更新屏保

```bash
cd ~/self-melt
# 重新生成 screensaver.html 后：
cp screensaver.html ~/Library/Screen\ Savers/SelfMelt/
```

在线版：`git push` 后等 GitHub Pages 更新即可，屏保 URL 不用改。

---

## 推荐配置

| 项目 | 建议 |
|------|------|
| URL | 在线：`.../self-melt/?screensaver=1` 或本地 `file://.../screensaver.html` |
| 空闲时间 | 5–10 分钟 |
| 需密码唤醒 | 按你安全习惯开启 |
| 电源适配器 | 接电源时允许屏保（电池可关掉以省电） |
