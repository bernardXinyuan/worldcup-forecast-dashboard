# 美加墨世界杯预测看板

面向普通球迷、赛事预测爱好者和内容运营者的 2026 美加墨世界杯预测看板项目。

项目目标：交付一个可直接上线使用的独立 Web 产品。产品不仅展示赛程和比分，还提供冠军概率、小组出线模拟、淘汰赛路径预测、单场胜平负预测、预测解释和数据可信说明。

## 文档入口

- [项目总规划](docs/00-project-plan.md)
- [产品 PRD](docs/01-product-prd.md)
- [多 Agent 协作工作流](docs/02-agent-workflow.md)
- [上下文交接规范](docs/03-context-handoff.md)
- [部署与上线交付](docs/04-deployment-release.md)
- [版本路线图与 Backlog](docs/05-roadmap-backlog.md)

## 当前阶段

阶段：MVP 已开发，可本地运行和构建部署。

## 本地运行

```bash
npm install
npm run generate:data
npm run dev -- --port 5276 --strictPort
```

访问：

```text
http://127.0.0.1:5276
```

## 构建上线

```bash
npm run build
```

构建产物位于 `dist/`。项目已包含 `vercel.json` 和 `netlify.toml`，可以部署到 Vercel、Netlify 或任意静态站点服务。

## 数据与模型

当前版本使用公开真实数据生成预测：

- `openfootball/worldcup.json`：2026 世界杯公开赛程数据。
- `martj42/international_results`：国家队历史比赛结果。

生成脚本：

```bash
npm run generate:data
```

模型输出包含：

- 全历史 Elo 实力。
- 2021 年以来近期状态。
- 场均进球、场均失球、净胜球趋势。
- 主办国加成。
- 逻辑回归胜平负概率。
- 泊松期望进球和预测比分。
- 蒙特卡洛小组出线概率。
- 冠军概率和因子贡献。
- 中文球队名称。
- 用户可调天气、盘口、阵容、球员状态、场地/主客场修正。
- 动态拟合状态可视化。

## 实时数据接入

当前没有伪造天气、庄家、阵容或伤停数据。页面已经提供手动预测输入和接入状态展示；自动实时更新需要配置授权 API。

接入说明见：[docs/06-live-data-adapters.md](docs/06-live-data-adapters.md)

## 后续增强

1. 接入官方 FIFA 排名快照。
2. 接入商业数据 API 获取伤停、名单、xG、赔率和实时赛果。
3. 增加淘汰赛完整 bracket 模拟。
4. 增加用户自定义比分模拟并生成分享链接。
