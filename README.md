# Self-Melt
Canvas2D 迷你代码融化特效，灵感源自 Andreas Gysin 的 Meltdown。
程序读取自身源代码并做语法高亮，通过噪声矢量场实现字符网格流动崩坏融化效果。

在线演示：https://lovelyrosa.github.io/self-melt/

## 本地快速运行
### 方式1：Python 静态服务
```bash
cd self-melt
python3 -m http.server 5174
# 浏览器访问 http://localhost:5174
```

### 方式2：NPM 启动
```bash
npm start
```

> **注意**：必须通过 HTTP 服务打开。直接双击 `index.html` 使用 `file://` 协议会跨域失败，仅展示一段示例文本。

## 操作快捷键
| 按键 | 功能 |
|-----|------|
| 空格 | 暂停 / 恢复动画 |
| R | 重置融化效果 |
| 1–4 | 切换配色：单色 / 矩阵绿 / 蓝屏 / 火焰橙 |
| `[` `]` | 减慢 / 加快融化流动 |
| `-` `=` | 缩小 / 放大字符格子 |
| `,` `.` | 调整整体动画速率 |
| 方向键 / 鼠标拖拽 | 滚动源代码视图 |
| H | 显示/隐藏控制面板 |

## 核心实现逻辑（对标 Meltdown 原作思路）
| 核心函数 | 功能说明 |
|-------|------|
| `loadSource()` | 拉取项目自身源码，把代码当作渲染素材 |
| `tokenizeSource()` | 简易词法分词，实现基础语法高亮 |
| `writeSourceIntoGrid()` | 将带样式代码写入字符网格 |
| `meltTick()` + `warpDir()` | 噪声矢量场算法，实现字符流动融化扭曲 |
| `draw()` | Canvas2D fillText 逐帧绘制字符画面 |

## macOS 屏幕保护程序
内置离线单文件产物 `screensaver.html`，搭配 WebViewScreenSaver 可用。
完整配置教程参考文档：[SCREENSAVER.md](./SCREENSAVER.md)

打包构建命令：
```bash
python3 scripts/build-screensaver.py
```
构建后可加载本地 `screensaver.html`，或在线地址拼接 `?screensaver=1` 进入屏保模式。

## License
MIT License，可自由使用、修改、分发。
本项目仅视觉创意参考 Andreas Gysin 的 Meltdown，并非其源码分支复刻。
