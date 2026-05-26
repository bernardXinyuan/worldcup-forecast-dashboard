# 上下文交接规范

## 1. 目的

本文件用于跨 agent、跨会话、跨上下文窗口保存项目状态。任何 agent 在开始工作前应先阅读本文件和 README。

## 2. 项目事实源

- 项目目标：`README.md`
- 总规划：`docs/00-project-plan.md`
- 产品需求：`docs/01-product-prd.md`
- Agent 协作：`docs/02-agent-workflow.md`
- 部署交付：`docs/04-deployment-release.md`
- 路线图：`docs/05-roadmap-backlog.md`

## 3. 开始任务前检查

1. 阅读 README。
2. 阅读本交接文档最新 3 条记录。
3. 阅读与当前任务直接相关的文档。
4. 检查工作区是否有未提交改动。
5. 明确本轮只处理哪些文件和目标。

## 4. 结束任务前检查

1. 更新相关文档或代码。
2. 运行必要验证。
3. 记录不能验证的原因。
4. 在本文件追加交接记录。
5. 列出下一步建议。

## 5. 交接记录

## 2026-05-26 20:45 Frontend/Data Agent

### 本轮目标

基于 Goal 模式开发可运行的独立世界杯预测 Web 产品，核心为真实公开数据、多维度回归预测和预测过程可视化。

### 已完成

- 搭建 React + Vite 前端应用。
- 新增公开数据生成脚本，拉取 2026 赛程和国家队历史比赛结果。
- 生成 Elo、近期状态、进攻、防守、净胜球趋势、主办国加成等特征。
- 输出单场胜平负概率、预测比分、因子贡献、小组出线模拟和冠军概率。
- 实现首页冠军榜、单场预测、小组模拟、模型流程、球队矩阵和数据说明。
- 增加 Vercel 与 Netlify 静态部署配置。
- 完成构建验证和 Chrome headless 桌面/移动端截图检查。

### 修改文件

- `package.json`
- `package-lock.json`
- `index.html`
- `scripts/generate-data.mjs`
- `src/main.jsx`
- `src/styles.css`
- `public/data/predictions.json`
- `vercel.json`
- `netlify.toml`
- `README.md`

### 关键决策

- MVP 采用公开数据优先：openfootball 赛程 + international_results 历史比赛。
- 预测模型采用可解释回归思路：Elo、近期状态、攻防指标、净胜球趋势、主办国因素。
- 单场比分使用泊松期望进球分布，小组出线使用蒙特卡洛模拟。
- 当前构建为前端静态产品，部署时在 build 阶段生成数据 JSON。

### 待处理问题

- 需要在正式公开发布前核对 openfootball 赛程与 FIFA 官方最终赛程是否完全一致。
- 当前未接入伤停、确认名单、xG、赔率和实时赛果，这些需要商业 API 或授权数据源。
- 淘汰赛 bracket 目前以冠军概率表呈现，尚未实现完整路径对阵模拟。

### 建议下一步

接入 FIFA 排名快照和商业 API 适配层，然后补齐淘汰赛 bracket、用户自定义比分模拟和分享链接。

## 2026-05-26 20:02 PM Agent

### 本轮目标

根据用户澄清，将项目从“门店使用的世界杯预测看板”调整为“独立的世界杯预测 Web 产品”。

### 已完成

- 移除门店、店员、线下大屏、门店配置、门店验收相关定位。
- 将目标用户调整为普通球迷、预测爱好者、内容运营者、数据维护者和技术运维。
- 将部署文档调整为独立 Web 产品上线交付，强调 HTTPS、SEO、分享、监控和数据兜底。
- 将 Backlog 中门店相关任务替换为移动端布局、球队详情、分享能力、SEO 和内容配置。

### 修改文件

- `README.md`
- `docs/00-project-plan.md`
- `docs/01-product-prd.md`
- `docs/02-agent-workflow.md`
- `docs/04-deployment-release.md`
- `docs/05-roadmap-backlog.md`
- `docs/03-context-handoff.md`

### 关键决策

- 产品不再面向门店，不包含门店交付、店员操作、大屏轮播或线下活动配置。
- 产品定位为公开访问的独立世界杯预测看板。
- MVP 重点为首页预测、赛程预测、小组模拟器、淘汰赛路径、球队详情、分享和数据说明。

### 待处理问题

- 部署文档已重命名为 `docs/04-deployment-release.md`。
- 需要确认 MVP 是否包含用户投票。
- 需要确认技术栈、数据源和预测模型方案。

### 建议下一步

进入技术方案和原型设计，优先确定数据模型、预测输出格式和首页信息架构。

## 2026-05-26 19:55 PM Agent

状态：历史记录，已被 2026-05-26 20:02 的独立 Web 产品方向替代。后续 agent 不应以本条记录作为需求依据。
