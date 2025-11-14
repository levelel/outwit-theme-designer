# 几维 Outwit 输入法主题设计工具

几维 Outwit 输入法主题设计工具是一个独立的开源配色工具，源自几维输入法 (Outwit) 的主题编辑器。它聚焦颜色定制与实时预览，预置了官方主题库，并可导出符合 Rime / Outwit 规范的 YAML 主题文件，方便分享与跨平台使用。

## 功能特性
- **即时预览**：横版与竖版候选面板同步更新，所见即所得。
- **官方主题集合**：内置 `@themes` 目录中的 35 套 Outwit 官方配色，可直接对比参考。
- **极简工作流**：支持主题标识 (color_scheme) 与显示名称编辑，不包含任何本地文件写入逻辑。
- **一键导出**：生成标准 `preset_color_schemes` 结构的 YAML 文件，可直接用于几维输入法或任意 Rime 前端。

## 快速开始
```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 构建生产版本
npm run build
```
开发模式将通过 Vite 启动本地服务器。构建产物默认输出至 `dist/` 目录，可直接部署到静态主机。

## 使用说明
1. 在页面右侧选择预设主题，或直接从默认主题开始调整。
2. 修改主题标识 (color_scheme) 与显示名称，确保导出文件命名清晰。
3. 使用颜色面板调节候选词、高亮状态、面板背景等颜色；支持透明度输入与十六进制编辑。
4. 点击「导出配置」即可下载 YAML 文件，包含 `preset_color_schemes` 定义，可直接复制到 Rime 或 Outwit 配置中。

> **提示**：预设主题的 YAML 位于 `src/presets/themes/` 目录。若需要添加新的预设，只需放入同结构的 YAML 文件并重新构建即可自动识别。

## 输出文件规范
导出的文件默认命名为 `<color_scheme>.yaml`，核心结构示例：

```yaml
preset_color_schemes:
  amber_tea:
    name: "琥珀茶韵／Amber Tea"
    author: "几维输入法"
    color_format: rgba
    text_color: 0xEFE6D7FF
    back_color: 0x14110DFF
    # ...更多颜色键
```

所有颜色均使用 `rgba` 顺序的十六进制格式 (`0xRRGGBBAA`)，满足 Rime 输入法与几维输入法的主题加载要求。

## Rime 兼容性说明
- 导出的 YAML 可以直接放入 `preset_color_schemes`，供 Rime 前端 (如 Weasel、鼠须管等) 使用。
- 若需作为 patch 引入，可自行在导出的文件外层添加 `patch:` 结构。
- 工具自身不读取、也不会写入用户目录中的任何配置文件，适合作为跨平台的纯前端配色助手。

## 项目结构
```
outwit-theme-designer/
├─ index.html
├─ package.json
├─ src/
│  ├─ App.svelte
│  ├─ main.ts
│  ├─ components/
│  │  ├─ ColorControls.svelte
│  │  ├─ OutwitPreview.svelte
│  │  └─ common/CustomSelect.svelte
│  ├─ presets/
│  │  ├─ index.ts
│  │  └─ themes/*.yaml
│  ├─ stores/themeStore.ts
│  ├─ constants/themeDefaults.ts
│  └─ utils/themeParser.ts
└─ ...
```

## 贡献
欢迎提交 Issue 或 Pull Request，共同完善主题预设与功能。如果你制作了新的配色，也欢迎 PR 到 `src/presets/themes/` 中，与更多用户分享。

## 许可证
项目默认沿用几维输入法的开源策略，若需商业或大规模分发，请联系原作者确认许可信息。
