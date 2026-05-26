import { mkdir, writeFile } from "node:fs/promises";

const FIXTURES_URL = "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";
const RESULTS_URL = "https://raw.githubusercontent.com/martj42/international_results/master/results.csv";
const FALLBACK_URLS = new Map([
  [FIXTURES_URL, "https://cdn.jsdelivr.net/gh/openfootball/worldcup.json@master/2026/worldcup.json"],
  [RESULTS_URL, "https://cdn.jsdelivr.net/gh/martj42/international_results@master/results.csv"]
]);

const HOSTS = new Set(["United States", "Mexico", "Canada"]);
const CONFED_HINTS = {
  Argentina: "CONMEBOL",
  Brazil: "CONMEBOL",
  Uruguay: "CONMEBOL",
  Colombia: "CONMEBOL",
  Ecuador: "CONMEBOL",
  France: "UEFA",
  England: "UEFA",
  Spain: "UEFA",
  Germany: "UEFA",
  Portugal: "UEFA",
  Netherlands: "UEFA",
  Belgium: "UEFA",
  Croatia: "UEFA",
  Italy: "UEFA",
  "Czech Republic": "UEFA",
  Switzerland: "UEFA",
  Austria: "UEFA",
  Denmark: "UEFA",
  Mexico: "CONCACAF",
  "United States": "CONCACAF",
  Canada: "CONCACAF",
  "Costa Rica": "CONCACAF",
  "South Korea": "AFC",
  Japan: "AFC",
  Iran: "AFC",
  Australia: "AFC",
  Morocco: "CAF",
  Senegal: "CAF",
  Tunisia: "CAF",
  Egypt: "CAF",
  "South Africa": "CAF"
};

const TEAM_ALIASES = new Map([
  ["USA", "United States"],
  ["United States of America", "United States"],
  ["Korea Republic", "South Korea"],
  ["Czechia", "Czech Republic"]
]);

const TEAM_ZH = {
  Argentina: "阿根廷",
  Australia: "澳大利亚",
  Austria: "奥地利",
  Belgium: "比利时",
  "Bosnia & Herzegovina": "波黑",
  Brazil: "巴西",
  Canada: "加拿大",
  "Cape Verde": "佛得角",
  Colombia: "哥伦比亚",
  Croatia: "克罗地亚",
  "Curaçao": "库拉索",
  "Czech Republic": "捷克",
  "DR Congo": "刚果（金）",
  Ecuador: "厄瓜多尔",
  Egypt: "埃及",
  England: "英格兰",
  France: "法国",
  Germany: "德国",
  Ghana: "加纳",
  Haiti: "海地",
  Iran: "伊朗",
  Iraq: "伊拉克",
  "Ivory Coast": "科特迪瓦",
  Japan: "日本",
  Jordan: "约旦",
  Mexico: "墨西哥",
  Morocco: "摩洛哥",
  Netherlands: "荷兰",
  "New Zealand": "新西兰",
  Norway: "挪威",
  Panama: "巴拿马",
  Paraguay: "巴拉圭",
  Portugal: "葡萄牙",
  Qatar: "卡塔尔",
  "Saudi Arabia": "沙特阿拉伯",
  Scotland: "苏格兰",
  Senegal: "塞内加尔",
  "South Africa": "南非",
  "South Korea": "韩国",
  Spain: "西班牙",
  Sweden: "瑞典",
  Switzerland: "瑞士",
  Tunisia: "突尼斯",
  Turkey: "土耳其",
  "United States": "美国",
  Uruguay: "乌拉圭",
  Uzbekistan: "乌兹别克斯坦",
  Algeria: "阿尔及利亚"
};

const VENUE_SIGNALS = {
  "Mexico City": { altitudeMeters: 2240, climate: "高海拔，控球和体能衰减更敏感", homeContext: "墨西哥本土强主场" },
  "Guadalajara (Zapopan)": { altitudeMeters: 1566, climate: "中高海拔，午后偏热", homeContext: "墨西哥本土强主场" },
  "Monterrey (Guadalupe)": { altitudeMeters: 540, climate: "炎热干燥，体能管理重要", homeContext: "墨西哥本土主场" },
  "Los Angeles (Inglewood)": { altitudeMeters: 38, climate: "温和干燥，旅行距离影响较小", homeContext: "美国主场环境" },
  "Santa Clara": { altitudeMeters: 22, climate: "温和海湾气候", homeContext: "美国主场环境" },
  "Seattle": { altitudeMeters: 53, climate: "凉爽湿润，草皮和降雨需临场确认", homeContext: "美国主场环境" },
  "Vancouver": { altitudeMeters: 70, climate: "凉爽湿润，降雨概率需赛前更新", homeContext: "加拿大主场环境" },
  "Toronto": { altitudeMeters: 76, climate: "夏季温暖潮湿", homeContext: "加拿大主场环境" },
  "Atlanta": { altitudeMeters: 320, climate: "室内/可控场馆倾向，湿热风险较低", homeContext: "美国主场环境" },
  "Dallas (Arlington)": { altitudeMeters: 184, climate: "室内/可控场馆倾向，外部高温影响较低", homeContext: "美国主场环境" },
  "Houston": { altitudeMeters: 24, climate: "室内/可控场馆倾向，外部湿热明显", homeContext: "美国主场环境" },
  "Kansas City": { altitudeMeters: 274, climate: "夏季炎热，风速需临场确认", homeContext: "美国主场环境" },
  "Miami (Miami Gardens)": { altitudeMeters: 2, climate: "高温高湿，体能和补水影响显著", homeContext: "美国主场环境" },
  "New York New Jersey (East Rutherford)": { altitudeMeters: 2, climate: "夏季温暖，旅行和时差更重要", homeContext: "美国主场环境" },
  "Philadelphia": { altitudeMeters: 12, climate: "夏季温暖潮湿", homeContext: "美国主场环境" },
  "Boston (Foxborough)": { altitudeMeters: 88, climate: "夏季温和，旅行影响更重要", homeContext: "美国主场环境" }
};

function normalizeTeam(name) {
  return TEAM_ALIASES.get(name) || name;
}

function teamZh(name) {
  return TEAM_ZH[name] || name;
}

function venueSignal(venue) {
  const signal = VENUE_SIGNALS[venue] || { altitudeMeters: 0, climate: "需接入赛前天气 API", homeContext: "中立或待确认" };
  return {
    venue,
    ...signal,
    weatherStatus: "实时天气通常只能在赛前 7-10 天可靠获取，当前使用场地气候基线",
    bookmakerStatus: "未配置赔率 API，接入后可加入市场隐含概率与盘口变化",
    lineupStatus: "未配置阵容/伤停 API，接入后可加入首发、伤停和球员状态",
    freshness: "赛程和历史比赛已实时拉取；天气、赔率、阵容等待外部授权源"
  };
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines.shift().split(",");
  return lines.map((line) => {
    const cols = [];
    let cur = "";
    let quoted = false;
    for (const char of line) {
      if (char === '"') quoted = !quoted;
      else if (char === "," && !quoted) {
        cols.push(cur);
        cur = "";
      } else cur += char;
    }
    cols.push(cur);
    return Object.fromEntries(headers.map((h, i) => [h, cols[i]]));
  });
}

async function fetchTextWithRetry(url, attempts = 4) {
  const urls = [url, FALLBACK_URLS.get(url)].filter(Boolean);
  let lastError;
  for (const candidate of urls) {
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        const response = await fetch(candidate, {
          headers: { "user-agent": "worldcup-forecast-dashboard/0.1" }
        });
        if (!response.ok) throw new Error(`${candidate} returned ${response.status}`);
        return await response.text();
      } catch (error) {
        lastError = error;
        await new Promise((resolve) => setTimeout(resolve, 600 * attempt));
      }
    }
  }
  throw lastError;
}

function expectedScore(a, b) {
  return 1 / (1 + 10 ** ((b - a) / 400));
}

function updateElo(teams, home, away, homeScore, awayScore, tournament, neutral) {
  const kBase = tournament.includes("World Cup") ? 50 : tournament.includes("qual") ? 35 : 22;
  const homeAdvantage = neutral ? 0 : 55;
  const a = teams.get(home)?.elo ?? 1500;
  const b = teams.get(away)?.elo ?? 1500;
  const expHome = expectedScore(a + homeAdvantage, b);
  const actualHome = homeScore > awayScore ? 1 : homeScore === awayScore ? 0.5 : 0;
  const margin = Math.log(Math.abs(homeScore - awayScore) + 1) + 1;
  const delta = kBase * margin * (actualHome - expHome);
  teams.set(home, { ...(teams.get(home) || {}), elo: a + delta });
  teams.set(away, { ...(teams.get(away) || {}), elo: b - delta });
}

function getTeamStats(results, teamsInCup) {
  const teams = new Map();
  const recent = new Map();
  const since2021 = new Map();
  const sorted = results
    .map((r) => ({
      ...r,
      dateObj: new Date(r.date),
      home_team: normalizeTeam(r.home_team),
      away_team: normalizeTeam(r.away_team),
      home_score: Number(r.home_score),
      away_score: Number(r.away_score),
      neutral: r.neutral === "TRUE"
    }))
    .filter((r) => Number.isFinite(r.home_score) && Number.isFinite(r.away_score))
    .sort((a, b) => a.dateObj - b.dateObj);

  for (const r of sorted) {
    updateElo(teams, r.home_team, r.away_team, r.home_score, r.away_score, r.tournament, r.neutral);
    if (r.dateObj >= new Date("2021-01-01")) {
      for (const side of ["home", "away"]) {
        const team = side === "home" ? r.home_team : r.away_team;
        const gf = side === "home" ? r.home_score : r.away_score;
        const ga = side === "home" ? r.away_score : r.home_score;
        const pts = gf > ga ? 3 : gf === ga ? 1 : 0;
        const list = since2021.get(team) || [];
        list.push({ gf, ga, pts, opponent: side === "home" ? r.away_team : r.home_team });
        since2021.set(team, list);
        const rec = recent.get(team) || [];
        rec.push({ gf, ga, pts, date: r.dateObj });
        if (rec.length > 12) rec.shift();
        recent.set(team, rec);
      }
    }
  }

  return [...teamsInCup].map((team) => {
    const rec = recent.get(team) || [];
    const all = since2021.get(team) || [];
    const elo = teams.get(team)?.elo ?? 1500;
    const matches = all.length || 1;
    const recentMatches = rec.length || 1;
    const attack = all.reduce((s, m) => s + m.gf, 0) / matches;
    const defense = all.reduce((s, m) => s + m.ga, 0) / matches;
    const form = rec.reduce((s, m) => s + m.pts, 0) / (recentMatches * 3);
    const goalDiff = all.reduce((s, m) => s + m.gf - m.ga, 0) / matches;
    return {
      id: team.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      name: team,
      nameZh: teamZh(team),
      confederation: CONFED_HINTS[team] || "TBD",
      hostBoost: HOSTS.has(team) ? 1 : 0,
      elo: Math.round(elo),
      recentForm: Number(form.toFixed(3)),
      attack: Number(attack.toFixed(2)),
      defense: Number(defense.toFixed(2)),
      goalDiff: Number(goalDiff.toFixed(2)),
      matchesSince2021: all.length
    };
  });
}

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function softmax(scores) {
  const max = Math.max(...scores);
  const exps = scores.map((s) => Math.exp(s - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

function poisson(lambda, k) {
  let fact = 1;
  for (let i = 2; i <= k; i++) fact *= i;
  return (Math.exp(-lambda) * lambda ** k) / fact;
}

function matchPrediction(home, away) {
  const eloDiff = home.elo - away.elo;
  const formDiff = home.recentForm - away.recentForm;
  const attackDiff = home.attack - away.attack;
  const defenseDiff = away.defense - home.defense;
  const goalDiff = home.goalDiff - away.goalDiff;
  const hostDiff = home.hostBoost - away.hostBoost;
  const strength = 0.0038 * eloDiff + 0.95 * formDiff + 0.42 * attackDiff + 0.36 * defenseDiff + 0.18 * goalDiff + 0.22 * hostDiff;
  const drawBase = 0.27 - Math.min(0.12, Math.abs(strength) * 0.045);
  const homeNoDraw = sigmoid(strength);
  const homeWin = (1 - drawBase) * homeNoDraw;
  const awayWin = (1 - drawBase) * (1 - homeNoDraw);
  const homeGoals = Math.max(0.2, 1.28 + 0.0016 * eloDiff + 0.38 * (home.attack - 1.2) - 0.31 * (away.defense - 1.1) + 0.12 * hostDiff);
  const awayGoals = Math.max(0.2, 1.18 - 0.0016 * eloDiff + 0.38 * (away.attack - 1.2) - 0.31 * (home.defense - 1.1) - 0.12 * hostDiff);
  const scoreGrid = [];
  for (let h = 0; h <= 5; h++) {
    for (let a = 0; a <= 5; a++) scoreGrid.push({ score: `${h}-${a}`, p: poisson(homeGoals, h) * poisson(awayGoals, a), h, a });
  }
  scoreGrid.sort((a, b) => b.p - a.p);
  const features = [
    { name: "Elo 实力差", value: Number((0.0038 * eloDiff).toFixed(3)), raw: eloDiff },
    { name: "近期状态", value: Number((0.95 * formDiff).toFixed(3)), raw: Number(formDiff.toFixed(3)) },
    { name: "进攻产量", value: Number((0.42 * attackDiff).toFixed(3)), raw: Number(attackDiff.toFixed(2)) },
    { name: "防守质量", value: Number((0.36 * defenseDiff).toFixed(3)), raw: Number(defenseDiff.toFixed(2)) },
    { name: "净胜球趋势", value: Number((0.18 * goalDiff).toFixed(3)), raw: Number(goalDiff.toFixed(2)) },
    { name: "东道主加成", value: Number((0.22 * hostDiff).toFixed(3)), raw: hostDiff }
  ];
  return {
    home: home.name,
    away: away.name,
    homeZh: home.nameZh,
    awayZh: away.nameZh,
    probabilities: {
      homeWin: Number(homeWin.toFixed(3)),
      draw: Number(drawBase.toFixed(3)),
      awayWin: Number(awayWin.toFixed(3))
    },
    expectedGoals: { home: Number(homeGoals.toFixed(2)), away: Number(awayGoals.toFixed(2)) },
    predictedScore: scoreGrid[0].score,
    topScores: scoreGrid.slice(0, 5).map((s) => ({ score: s.score, probability: Number(s.p.toFixed(3)) })),
    featureContributions: features,
    confidence: Number((Math.min(0.92, 0.52 + Math.abs(strength) * 0.12 + Math.abs(homeGoals - awayGoals) * 0.06)).toFixed(2))
  };
}

function pickOutcome(pred, rng = Math.random) {
  const r = rng();
  const { homeWin, draw } = pred.probabilities;
  if (r < homeWin) return "home";
  if (r < homeWin + draw) return "draw";
  return "away";
}

function simulateGroup(groupMatches, teamMap, runs = 1800) {
  const teams = [...new Set(groupMatches.flatMap((m) => [m.team1, m.team2]))];
  const agg = Object.fromEntries(teams.map((t) => [t, { first: 0, second: 0, advance: 0, points: 0 }]));
  for (let i = 0; i < runs; i++) {
    const table = Object.fromEntries(teams.map((t) => [t, { team: t, pts: 0, gf: 0, ga: 0 }]));
    for (const m of groupMatches) {
      const pred = matchPrediction(teamMap.get(m.team1), teamMap.get(m.team2));
      const outcome = pickOutcome(pred);
      const [ph, pa] = pred.predictedScore.split("-").map(Number);
      let hs = ph;
      let as = pa;
      if (outcome === "draw") {
        const level = Math.round((ph + pa) / 2);
        hs = level;
        as = level;
      } else if (outcome === "home" && hs <= as) hs = as + 1;
      else if (outcome === "away" && as <= hs) as = hs + 1;
      table[m.team1].gf += hs;
      table[m.team1].ga += as;
      table[m.team2].gf += as;
      table[m.team2].ga += hs;
      if (hs > as) table[m.team1].pts += 3;
      else if (hs < as) table[m.team2].pts += 3;
      else {
        table[m.team1].pts += 1;
        table[m.team2].pts += 1;
      }
    }
    const ranked = Object.values(table).sort((a, b) => b.pts - a.pts || b.gf - b.ga - (a.gf - a.ga) || b.gf - a.gf);
    ranked.forEach((row, idx) => {
      agg[row.team].points += row.pts;
      if (idx === 0) agg[row.team].first++;
      if (idx === 1) agg[row.team].second++;
      if (idx < 2) agg[row.team].advance++;
    });
  }
  return teams.map((team) => ({
    team,
    teamZh: teamZh(team),
    first: Number((agg[team].first / runs).toFixed(3)),
    second: Number((agg[team].second / runs).toFixed(3)),
    advance: Number((agg[team].advance / runs).toFixed(3)),
    expectedPoints: Number((agg[team].points / runs).toFixed(2))
  })).sort((a, b) => b.advance - a.advance);
}

async function main() {
  const [fixturesText, resultsText] = await Promise.all([fetchTextWithRetry(FIXTURES_URL), fetchTextWithRetry(RESULTS_URL)]);
  const fixturesRaw = JSON.parse(fixturesText);
  const results = parseCsv(resultsText);
  const groupMatches = fixturesRaw.matches
    .filter((m) => m.group)
    .map((m, idx) => ({
      id: `m-${idx + 1}`,
      round: m.round,
      date: m.date,
      time: m.time,
      team1: normalizeTeam(m.team1),
      team2: normalizeTeam(m.team2),
      group: m.group.replace("Group ", ""),
      venue: m.ground
    }));
  const teamsInCup = new Set(groupMatches.flatMap((m) => [m.team1, m.team2]));
  const teams = getTeamStats(results, teamsInCup);
  const teamMap = new Map(teams.map((t) => [t.name, t]));
  const matches = groupMatches.map((m) => ({
    ...m,
    team1Zh: teamZh(m.team1),
    team2Zh: teamZh(m.team2),
    venueSignal: venueSignal(m.venue),
    prediction: matchPrediction(teamMap.get(m.team1), teamMap.get(m.team2))
  }));
  const groups = [...new Set(groupMatches.map((m) => m.group))].map((group) => ({
    group,
    matches: matches.filter((m) => m.group === group).map((m) => m.id),
    teams: simulateGroup(groupMatches.filter((m) => m.group === group), teamMap)
  }));
  const titleScores = softmax(teams.map((t) => 0.006 * (t.elo - 1500) + 1.25 * t.recentForm + 0.42 * t.attack - 0.34 * t.defense + 0.12 * t.hostBoost));
  const championTable = teams
    .map((team, idx) => ({
      team: team.name,
      teamZh: team.nameZh,
      probability: Number(titleScores[idx].toFixed(4)),
      semifinal: Number(Math.min(0.78, titleScores[idx] * 7.8).toFixed(3)),
      final: Number(Math.min(0.48, titleScores[idx] * 4.2).toFixed(3)),
      drivers: [
        { name: "Elo", value: Number((0.006 * (team.elo - 1500)).toFixed(3)) },
        { name: "近期状态", value: Number((1.25 * team.recentForm).toFixed(3)) },
        { name: "进攻", value: Number((0.42 * team.attack).toFixed(3)) },
        { name: "防守", value: Number((-0.34 * team.defense).toFixed(3)) }
      ]
    }))
    .sort((a, b) => b.probability - a.probability);
  const model = {
    name: "Explainable Elo + Form Regression v0.1",
    trainedOn: "International results CSV, 1872-present; features weighted on post-2021 form and full-history Elo.",
    updateTime: new Date().toISOString(),
    sources: [
      { name: "openfootball/worldcup.json 2026 fixtures", url: FIXTURES_URL },
      { name: "martj42/international_results historical match results", url: RESULTS_URL },
      { name: "Weather adapter", url: "未配置：建议接入 Open-Meteo / WeatherAPI / Visual Crossing" },
      { name: "Bookmaker odds adapter", url: "未配置：建议接入 The Odds API / Sportradar / Opta 授权数据" },
      { name: "Lineup and player status adapter", url: "未配置：建议接入 Sportradar / Stats Perform / API-Football 授权数据" }
    ],
    features: [
      "Elo rating from full historical international results",
      "Recent form points per match since 2021",
      "Goals for per match since 2021",
      "Goals against per match since 2021",
      "Goal difference trend since 2021",
      "Host boost for United States, Mexico and Canada",
      "Venue climate baseline and altitude context",
      "User-adjustable bookmaker, lineup, weather and player state signals",
      "Poisson expected goals for scoreline distribution",
      "Monte Carlo group simulation"
    ],
    limitations: [
      "Open public data does not include live injuries, confirmed squads, betting market movement, or xG unless a paid provider is added.",
      "Future fixtures depend on the upstream public schedule dataset; verify against FIFA before public launch.",
      "Predictions are for entertainment and analysis, not betting advice."
    ]
  };
  await mkdir("public/data", { recursive: true });
  await writeFile("public/data/predictions.json", JSON.stringify({ model, teams, matches, groups, championTable }, null, 2), "utf8");
  console.log(`Generated ${teams.length} teams, ${matches.length} group matches, ${groups.length} groups.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
