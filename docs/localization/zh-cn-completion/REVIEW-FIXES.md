# 独立验收问题修复记录

审查基线：`5a7706a1e0f4ea50c6c7ae014ff2a646624551f0`。修复保留在 `i18n/zh-cn-completion`，本记录仅描述本轮增量，不替代前一阶段报告。

## 处理结果

1. `src/i18n/locales/zh-CN.ts`：修正 `localization.topBucket.noEvents`、`localization.aiSummary.noHost`、`localization.categoryBuilder.noHost` 三处中文语序和多余空格。分别改为“所选监控组件在此时间范围内没有事件。”、“找不到包含窗口监控组件存储桶的主机。”、“没有同时包含窗口和 AFK 存储桶的主机。请安装监控组件以开始收集数据。”
2. `src/util/time.ts`：只在 `zh-CN` 且 `unitOnly=true` 时，使用现有浏览器 `Intl.NumberFormat` 的窄单位格式，省略“前/后”，未来保留 `+`。秒差、单位阈值、30 天月/365 天年、截断取整规则全部保留；中文桌面格式、英文和其他语言代码路径保持不变。无需调整布局或 CSS。
3. `buildBarchartDatasetActive()` 的 `Total time` 当前不可达，未修改该函数。`rg -n 'buildBarchartDatasetActive' src test` 仅命中 `src/util/datasets.ts:90` 的定义，无导入、调用或动态索引引用。实际图表入口 `SelectableVisualization.vue:322`、`Report.vue:123`、`Trends.vue:316` 均调用 `buildBarchartDataset()`；当前未把该模块作为可动态访问的命名空间导入。因此现有页面没有路径显示该标签。未来重新启用此辅助函数时仍须接入翻译。
4. `test/unit/compactRelativeTime.test.ts`：新增 12 组简体中文回归用例，覆盖全部六种单位、临界值截断、零值、未来方向及完整桌面格式。原有英文、瑞典语用例继续通过。
5. 提交和推送仅限既有汉化分支；不修改 master、不创建 PR、不改采集/存储/同步或机器导出格式，也不新增依赖。

## 本轮验证

- `npm test -- --runInBand --coverage=false --runTestsByPath test/unit/compactRelativeTime.test.ts test/unit/time.test.ts test/unit/ChineseLocalization.test.ts test/unit/datasets.test.node.ts`：4 套件、43 项测试通过。保留现有 babel-plugin-lodash 和 Vue Test Utils 弃用提示，未静默忽略诊断。
- `npm run check:locales`：通过，简体中文 916/916，键名和插值检查通过。
- `npm run lint -- --no-fix`：退出码 0，0 错误、2 条 `vue.config.js:8–9` 的 `no-shadow` 警告；该文件本轮未改动。单独对 3 个修改的源码/测试文件运行 ESLint：0 错误、0 警告。
- `npx vite build --outDir /tmp/aw-webui-review-vite`：成功。现有 Sass 弃用、第三方注释和包体积提示仍然可见。
- `npm run typecheck:test`：退出码 2，仅报告 `transforms.test.node.ts(8,41)`、`(8,53)` 两处既有 TS2339，与前阶段已验证的基线错误一致；该测试文件及类型检查配置未修改，未掩盖错误。
- `git diff --check`：通过。

### 390px 存储桶列表

实际 Chromium（浏览器语言 en-US、应用语言 zh-CN），390×844；全部 API 均为模拟响应，拦截外部请求，未读取任何真实活动记录，未请求 events、query、export 或 import 接口。冻结模拟时钟，8 个带长 ID 的存储桶覆盖秒、分、时、天、月、年和未来时间。原基线也没有横向溢出，本次修复解决的是 `unitOnly` 未对中文生效及显示长度不一致，未将原基线描述成溢出缺陷。

修复前后 document.scrollWidth 均为 390px；所有行的名称、时间标签、菜单均不重叠，菜单在视口内。修复后的名称可用宽度至少 242.86px；名称按原有样式省略，完整 ID 的链接和原始时间属性保留。英文切换后显示 `0s`；切回中文、1440px 桌面下仍为 `0秒前`。无未捕获页面异常。截图已人工查看。

| 修复前窄屏标签 | 修复后窄屏标签 | 名称可用宽度（px） |
| -------------- | -------------- | ------------------ |
| 0 秒前         | 0 秒           | 250.62 → 264.62    |
| 59 秒前        | 59 秒          | 242.86 → 256.86    |
| 59 分钟前      | 59 分钟        | 228.86 → 242.86    |
| 23 小时前      | 23 小时        | 228.86 → 242.86    |
| 29 天前        | 29 天          | 242.86 → 256.86    |
| 11 个月前      | 11 个月        | 228.86 → 242.86    |
| 10 年前        | 10 年          | 242.86 → 256.86    |
| 1 小时后       | +1 小时        | 236.62 → 242.86    |

[390px 截图](review-buckets-390px.png) · [本轮测试及检查证据](review-validation.txt)

## 验证边界

本轮运行了相关测试和 Vite 生产构建，未重跑全量 Jest 或 Webpack 构建；前次完整验证见原报告。未验证真实 Windows/Tauri、Android WebView、旧版浏览器和所有辅助技术。新增显示路径使用浏览器原生 Intl 单位格式支持，未增加 polyfill 或第三方库。用户已安装的 ActivityWatch v0.14.1 不会因本次推送自动更新。
