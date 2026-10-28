# aw-webui 简体中文本地化：第二阶段交付记录

> 本文归档第二阶段已经完成的实现与测试结果。以下未提交、未推送等描述指第二阶段结束时的状态；成果保存阶段的提交信息以本分支 Git 历史为准。本次归档没有重新运行测试或构建。

验收证据：[测试结果摘录](validation.txt)、[桌面总览](desktop-summary.png)、[390px 窄屏总览](mobile-summary.png)。

## 第二阶段结束时的基线与交付状态

- 审查基线：`0b73e83452390bfe60bdbdbd70a888ef255024d5`。
- 当前工作分支：`work`，HEAD 保持上述提交。开始实施时工作区干净。
- 修改保留为本地未提交差异；没有推送、合并或创建 PR，没有修改用户正在运行的 ActivityWatch。
- 未访问真实活动记录；浏览器 API 全部由本地模拟响应提供，其他外部请求被拦截。
- 原始报告和完整证据保留在执行工作区。本文与结果摘录、两张截图在成果保存阶段归档到本分支，供独立验收；未重新开发实现。

## 修改摘要

补齐原有 11 个资源键问题，新增 91 个提取文案键；英文与简体中文现均为 916 键。中文检查达到 916/916。其他语言对新增 `localization.*` 文案沿用英文回退，其原有翻译文件未改动；覆盖率分母增加会导致它们的统计百分比下降，不表示已有译文被删除。

内置视图通过 `src/util/displayNames.ts` 转换显示名称，保留 `src/stores/views.ts` 中默认数据与迁移比较值。仅当 ID 和原始名称同时符合内置定义时翻译，用户重命名和自定义 ID 不匹配此规则。

保留分类与查询标识、正则、应用名和用户输入。系统 `Uncategorized` 仅转换显示；`searched` 只在明确由自定义正则产生的报告图表中转换，用户自建同名分类继续显示原名。旭日图保留根节点 `All` 供颜色判断。

沿用 Vue i18n，补齐 BootstrapVue 的按钮及辅助功能文案，增加日期控件包装以透传原有值和事件、提供中文按钮，并同步 Luxon、FullCalendar、vis-timeline 和 Intl 的语言。部分图表在语言变化时重画，不重新查询活动数据。未修改 CSV/JSON 机器字段，仅翻译原生保存窗口标题。

## 问题编号对应

上轮 A、C、E 表没有逐行编号，本记录按各表原顺序记为 A1–A11、C1–C11、E1–E9；B 编号直接沿用上轮。

### A：资源键

A1–A2：翻译质量提示、参与翻译说明；A3–A10：精确时间段名称、开始与结束、非法时间段、时区跳时与重时、最长跨度、结束时间校验；A11：未分类提示中的精确时间段。全部补齐，保留原命名参数。

### B：代码接入

| 编号 | 已处理范围 |
| --- | --- |
| B01–B03 | 用户反馈链接、全局错误说明、无 JavaScript 时的中英双语静态提示 |
| B04–B06 | 四个内置视图、监控组件停止提示、编辑器浮层字段 |
| B07–B09 | 零时长数据空状态、未分类显示、旭日图根节点显示 |
| B10–B13 | 设备活跃时长、所选时间段、缺失值、时钟当前时间 |
| B14 | 日期移动、今天、辅助功能标签、秒级相对时间、上一/下一时段提示 |
| B15–B16 | 分类时间线失败提示、分类活动行标题 |
| B17 | 新建分类的本地化默认名称；正则初始代码 `FILL ME` 保留，不把代码当文案改写 |
| B18–B22 | 分类保存/导入、分类集确认弹窗、分类助手、通知设置及隐私规则校验消息 |
| B23–B24 | 设备诊断、秒表按钮及加载失败提示 |
| B25–B27 | 查询计数与确认弹窗、搜索错误前缀、提醒表单校验及保存失败 |
| B28 | 新默认 AI 提示词、模型示例、本项目生成的错误前缀；用户改过的提示词保持原样 |
| B29 | 时间线事件浮层表头，保留转义、DOMPurify 和原始事件内容 |
| B30 | 自定义正则的系统结果标签，仅在明确由自定义正则产生的报告图表中使用中文 |

### C：中文质量

C1 页脚语序；C2 首页启动页面说明；C3 重新启用更新检查说明；C4 主要排行榜名称；C5 泛指监控组件的术语；C6 评分公式；C7 未分类完整句的周期拼接；C8 “最近一段时间”；C9 “分类助手”；C10 “存储桶”；C11 事件聚合视图“汇总”。均按上下文调整，Activity 默认 Summary 使用“总览”。

### E：第三方及环境事项

| 编号 | 处理与限制 |
| --- | --- |
| E1 BootstrapVue | 补齐默认弹窗确认/取消、关闭标签、文件浏览及不允许拖放提示、菜单和加载辅助文案。仅对可关闭通知设置关闭标签。 |
| E2 vue-datetime | 增加透传包装，提供确认/取消并同步 Luxon；语言变化重新创建日期控件，父组件绑定值保留。自动测试使用真实日期组件验证。 |
| E3 FullCalendar | 使用现有依赖的语言资源并传入应用语言；已有日历测试通过。 |
| E4 vis-timeline | 配置库内语言短语、同步日期轴语言并刷新缓存显示。 |
| E5 原生日期与 Intl | Intl 默认跟随应用语言；原生 HTML 日期框的系统界面和格式仍由浏览器/操作系统控制。 |
| E6 即时切换 | 图表、空状态、通知选项、日期控件等跟随语言更新。已经生成的外部错误详情、用户文字及模型内容不做自动翻译。 |
| E7 导出与原生窗口 | 保存窗口标题已接入翻译；CSV 表头、JSON 字段和机器导出格式保持兼容。未在真实 Windows/Tauri 保存窗口中验证。 |
| E8 AI 数据模板 | 保留用于模型输入的活动上下文及原始数据模板；新默认提示词可中文显示，不调用真实模型验证。 |
| E9 隐藏/开发路径 | 查询时间段行、多选提示等接入翻译；没有逐一人工触发全部隐藏分支。 |

## 测试与构建

每批修改后执行相应测试，最终结果如下：

| 检查 | 命令/结果 |
| --- | --- |
| 全量单元测试 | Jest `--runInBand --coverage=false`：103 组通过，1338 项通过；1 组及 30 项跳过；4 个快照通过，没有更新快照 |
| 新增中文测试 | `ChineseLocalization.test.ts` 7 项，`displayNames.test.ts` 3 项，全部通过 |
| 翻译检查 | `node scripts/check-locales.mjs`：中文 916/916，键与占位符检查通过；其他语言保留其既有警告 |
| Lint | `node node_modules/eslint/bin/eslint.js --ext .js,.ts,.vue src test`：零错误、零警告；未使用自动修复掩盖问题 |
| Webpack | `npm run build -- --dest /tmp/aw-webui-localized-dist`：成功 |
| Vite | `node node_modules/vite/bin/vite.js build --emptyOutDir --outDir /tmp/aw-webui-localized-vite`：成功 |
| 差异空白检查 | `git diff --check`：通过 |
| 测试类型检查 | **未通过：两处既有错误，见下文** |

`npm run typecheck:test` 在 `test/unit/transforms.test.node.ts:8` 的第 41、53 列报告 TS2339：`object` 类型没有 `id` 属性。已使用 `git archive HEAD` 在独立临时目录还原基线并执行同一 TypeScript 检查，得到完全相同的两处错误。本轮未修改该文件、Jest 配置、TypeScript 配置或诊断规则。该文件的 Jest 运行时测试通过，不等同于测试类型检查通过。

构建仍有工具链的 Sass/Babel 弃用及资源体积提示；没有为本轮改动升级依赖或放宽构建设置。

## 浏览器验证

使用环境已有的 Chromium 与 Playwright Core，运行生产 Webpack 产物。浏览器语言设为 `en-US`，应用选择简体中文，以检验应用语言独立于浏览器。所有 API 由拦截器返回虚构的 demo 主机、应用、窗口、网站及编辑器事件；禁止请求真实 ActivityWatch 或外部 LLM。

最终 16 项检查全部通过，无未捕获页面错误：四个默认视图及自定义名称、排行/未分类/用户数据、“展开更多”、精确时间段的辅助标签、分类弹窗、日期移动、真实时间线悬浮提示、通知阈值校验、查询弹窗空名称错误、中英文切换、保存视图未变化，以及桌面 1440×1000 和窄屏 390×844 布局。窄屏总览和设置均通过页面宽度无横向溢出的断言。已人工查看总览桌面和窄屏截图。

GitHub 可直接访问本目录的测试结果摘录与两张总览截图。完整原始日志、其余截图和环境专用浏览器脚本保留在执行工作区 `/workspace/aw-localization-evidence`，不作为项目依赖或临时文件提交。

测试的是本次源码构建。截图中的服务器版本 `v0.14.1` 仅为模拟元数据，不能用来证明真实 v0.14.1 安装包已经获得这些翻译。

## 不变量、风险与审查重点

- 没有新增依赖，`package.json`、锁文件未变。
- 采集、存储、同步、查询生成及计算逻辑没有修改；`src/stores/*` 与 `src/queries.ts` 未变。
- `src/util/privacyFilters.ts` 仅调整校验错误文案；测试验证合法 DTO 不受语言影响。
- `src/util/export.ts` 仅调整原生窗口标题；测试验证机器 CSV 字段与内容跨语言一致。
- 审查内置视图显示匹配、系统分类标识与用户同名内容的区分、浮层转义、语言切换刷新和日期控件值/事件透传。
- 默认 AI 提示词属于用户可见预设；只在尚未被用户编辑时随语言切换，未改变 API 密钥处理、上下文隐私筛选或发送路径。
- 新提取文案集中在 `localization.*`，其他语言允许英文回退；中文缺键或普通英文残留现在使翻译检查失败。原有其他命名空间的缺键要求保持。

## 未验证范围与下一阶段

未验证真实 Windows/Tauri 原生保存窗口、Android WebView/原生程序、完整读屏软件、所有第三方交互状态、所有隐藏开发功能、真实后端错误和真实 LLM 输出，也没有核验用户安装的 v0.14.1 包。原生日期框仍可能显示操作系统/浏览器语言；机器接口字段及原始数据中的英文是保留内容。

适合进入人工最终验收和上游 PR 准备。不能称为所有检查全绿：测试类型检查仍有两处已复现的基线错误，应在提交说明中明确列出，或由独立修复处理。本轮没有创建提交或 PR；合并、推送、部署与替换用户安装包均未执行。

## 涉及文件

共 63 个源码/测试文件差异（包含新文件）；以下为最终工作区清单：

- `index.html`
- `scripts/check-locales.mjs`
- `src/components/CategoryEditModal.vue`
- `src/components/ErrorBoundary.vue`
- `src/components/EventEditor.vue`
- `src/components/Header.vue`
- `src/components/InputTimeInterval.vue`
- `src/components/NewReleaseNotification.vue`
- `src/components/SelectCategoriesOrPattern.vue`
- `src/components/SelectableVisualization.vue`
- `src/components/UncategorizedNotification.vue`
- `src/components/UserSatisfactionPoll.vue`
- `src/components/WatcherLivenessBanner.vue`
- `src/i18n/index.ts`
- `src/i18n/locales/en.ts`
- `src/i18n/locales/zh-CN.ts`
- `src/main.ts`
- `src/util/aiSummary.ts`
- `src/util/datasets.ts`
- `src/util/export.ts`
- `src/util/privacyFilters.ts`
- `src/util/time.ts`
- `src/util/tooltip.ts`
- `src/views/AISummaryView.vue`
- `src/views/Alerts.vue`
- `src/views/BillingView.vue`
- `src/views/Buckets.vue`
- `src/views/Home.vue`
- `src/views/QueryExplorer.vue`
- `src/views/Report.vue`
- `src/views/Search.vue`
- `src/views/Stopwatch.vue`
- `src/views/Timeline.vue`
- `src/views/Trends.vue`
- `src/views/WorkReport.vue`
- `src/views/activity/Activity.vue`
- `src/views/activity/ActivityView.vue`
- `src/views/settings/AwNotifySettings.vue`
- `src/views/settings/CategorizationSettings.vue`
- `src/views/settings/CategoryBuilder.vue`
- `src/visualizations/Calendar.vue`
- `src/visualizations/CategoryTree.vue`
- `src/visualizations/PeriodUsage.vue`
- `src/visualizations/Score.vue`
- `src/visualizations/Summary.vue`
- `src/visualizations/SunburstCategories.vue`
- `src/visualizations/SunburstClock.vue`
- `src/visualizations/TimelineInspect.vue`
- `src/visualizations/TimelineSimple.vue`
- `src/visualizations/Timespiral.vue`
- `src/visualizations/TopBucketData.vue`
- `src/visualizations/VisTimeline.vue`
- `src/visualizations/periodusage.ts`
- `src/visualizations/summary.ts`
- `src/visualizations/sunburst-clock.ts`
- `test/unit/QueryExplorer.test.ts`
- `test/unit/Search.test.ts`
- `test/unit/VisTimeline.test.ts`
- `test/unit/i18n.test.ts`
- `src/components/LocalizedDatetime.vue`
- `src/util/displayNames.ts`
- `test/unit/ChineseLocalization.test.ts`
- `test/unit/displayNames.test.ts`
