# 实时数据适配层规划

当前产品已经接入公开真实数据：

- 赛程：`openfootball/worldcup.json`
- 历史国家队比赛：`martj42/international_results`

以下实时维度已经在前端分析台预留输入和可视化位置，但需要授权 API 才能做到真正自动实时更新。

## 1. 天气

推荐数据源：

- Open-Meteo：适合免费天气预报和历史天气。
- Visual Crossing：适合场馆级历史天气和未来预报。
- WeatherAPI：适合实时天气和短期预报。

接入字段：

- 比赛城市。
- 开球时间。
- 温度。
- 湿度。
- 降雨概率。
- 风速。
- 体感温度。
- 天气更新时间。

当前策略：

- 赛前 7-10 天之前不伪造天气预报。
- 当前只展示场地气候/海拔基线。

## 2. 庄家/市场数据

推荐数据源：

- The Odds API。
- Sportradar Odds。
- Opta/Stats Perform 授权市场数据。

接入字段：

- 主胜、平局、客胜赔率。
- 盘口。
- 大小球。
- 赔率更新时间。
- 多家公司均值和离散程度。

当前策略：

- 未配置 API 时不展示假赔率。
- 用户可以手动调整“庄家盘口”滑杆模拟市场倾斜。

## 3. 阵容与球员状态

推荐数据源：

- Sportradar Soccer。
- Stats Perform / Opta。
- API-Football。

接入字段：

- 预计首发。
- 确认首发。
- 伤停名单。
- 停赛名单。
- 球员近期出场时间。
- 球员进球、助攻、评分或 xG/xA。

当前策略：

- 未配置 API 时不展示假阵容。
- 用户可以手动调整双方阵容和球员状态。

## 4. 模型接入方式

实时源统一转换为 match signal：

```json
{
  "matchId": "m-1",
  "weather": -1,
  "market": 2,
  "homeLineup": 1,
  "awayLineup": -1,
  "homePlayers": 2,
  "awayPlayers": 0,
  "venue": 1,
  "updatedAt": "2026-06-11T12:00:00Z"
}
```

取值范围：

- `-3` 明显不利主队。
- `0` 中性或无数据。
- `+3` 明显有利主队。

前端当前已支持这些字段的手动输入和即时拟合可视化；后续接入 API 后，只需把实时信号写入数据 JSON 或 API 响应。

