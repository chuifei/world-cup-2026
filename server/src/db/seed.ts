import { createTables } from './schema'
import { getDb } from './connection'

createTables()

const db = getDb()

const venues = [
  { id: 'azteca', name: '阿兹特克体育场', city: '墨西哥城', country: '墨西哥', capacity: 87523, matches_count: 5, description: '历史悠久的传奇球场，曾举办1970年和1986年世界杯决赛。' },
  { id: 'bbva', name: 'BBVA体育场', city: '蒙特雷', country: '墨西哥', capacity: 53500, matches_count: 4, description: '现代化的足球专用球场，坐落在蒙特雷山脉背景下。' },
  { id: 'akron', name: '阿克伦体育场', city: '瓜达拉哈拉', country: '墨西哥', capacity: 49850, matches_count: 4, description: '墨西哥最具特色的球场之一，拥有独特的建筑风格。' },
  { id: 'metlife', name: '大都会人寿体育场', city: '纽约', country: '美国', capacity: 82500, matches_count: 6, description: '纽约地区的标志性体育场馆，将承办包括决赛在内的重要比赛。' },
  { id: 'sofi', name: 'SoFi体育场', city: '洛杉矶', country: '美国', capacity: 70240, matches_count: 5, description: '世界最先进的体育场之一，拥有巨型双面屏幕。' },
  { id: 'hardrock', name: '硬石体育场', city: '迈阿密', country: '美国', capacity: 65326, matches_count: 5, description: '迈阿密花园的标志性体育场，承办过多届超级碗。' },
  { id: 'att', name: 'AT&T体育场', city: '达拉斯', country: '美国', capacity: 80000, matches_count: 5, description: '拥有可伸缩屋顶的巨型体育场，被誉为美国之队的主场。' },
  { id: 'mercedes', name: '梅赛德斯-奔驰体育场', city: '亚特兰大', country: '美国', capacity: 71000, matches_count: 5, description: '超现代化体育场，拥有独特的可伸缩花瓣式屋顶。' },
  { id: 'nrg', name: 'NRG体育场', city: '休斯顿', country: '美国', capacity: 72220, matches_count: 4, description: '德克萨斯州最大的体育场之一，配备可伸缩屋顶。' },
  { id: 'arrowhead', name: '箭头体育场', city: '堪萨斯城', country: '美国', capacity: 76416, matches_count: 4, description: '以狂热气氛著称的体育场，美国足球文化的重要地标。' },
  { id: 'gillette', name: '吉列体育场', city: '波士顿', country: '美国', capacity: 65878, matches_count: 4, description: '新英格兰地区的顶级体育场馆。' },
  { id: 'lincoln', name: '林肯金融体育场', city: '费城', country: '美国', capacity: 67594, matches_count: 4, description: '费城老鹰队主场，拥有绝佳的城市天际线景观。' },
  { id: 'levis', name: '李维斯体育场', city: '旧金山', country: '美国', capacity: 68500, matches_count: 4, description: '硅谷核心地带的高科技体育场。' },
  { id: 'lumen', name: '流明体育场', city: '西雅图', country: '美国', capacity: 68740, matches_count: 4, description: '西北太平洋地区的标志性体育场，拥有独特的声学设计。' },
  { id: 'bmo', name: 'BMO体育场', city: '多伦多', country: '加拿大', capacity: 45000, matches_count: 4, description: '加拿大最大的足球专用体育场之一。' },
  { id: 'bcplace', name: 'BC广场体育场', city: '温哥华', country: '加拿大', capacity: 54320, matches_count: 4, description: '拥有可伸缩缆绳支撑屋顶的独特建筑，温哥华地标。' },
]

const insertVenue = db.prepare(
  'INSERT OR REPLACE INTO venues (id, name, city, country, capacity, matches_count, description) VALUES (?, ?, ?, ?, ?, ?, ?)'
)

for (const v of venues) {
  insertVenue.run(v.id, v.name, v.city, v.country, v.capacity, v.matches_count, v.description)
}

const tournaments = [
  { year: 1930, host: '乌拉圭', hostFlagCode: 'uy', champion: '乌拉圭', championFlagCode: 'uy', runnerUp: '阿根廷', runnerUpFlagCode: 'ar', thirdPlace: '美国', thirdPlaceFlagCode: 'us', fourthPlace: '南斯拉夫', fourthPlaceFlagCode: 'rs', topScorer: '斯塔比莱', topScorerGoals: 8, bestPlayer: '纳萨奇', bestGoalkeeper: '巴莱斯特雷罗', totalGoals: 70, totalMatches: 18, totalAttendance: 590549, teamsCount: 13 },
  { year: 1934, host: '意大利', hostFlagCode: 'it', champion: '意大利', championFlagCode: 'it', runnerUp: '捷克斯洛伐克', runnerUpFlagCode: 'cz', thirdPlace: '德国', thirdPlaceFlagCode: 'de', fourthPlace: '奥地利', fourthPlaceFlagCode: 'at', topScorer: '内耶德利', topScorerGoals: 5, bestPlayer: '梅阿查', bestGoalkeeper: '普拉尼卡', totalGoals: 70, totalMatches: 17, totalAttendance: 363000, teamsCount: 16 },
  { year: 1938, host: '法国', hostFlagCode: 'fr', champion: '意大利', championFlagCode: 'it', runnerUp: '匈牙利', runnerUpFlagCode: 'hu', thirdPlace: '巴西', thirdPlaceFlagCode: 'br', fourthPlace: '瑞典', fourthPlaceFlagCode: 'se', topScorer: '莱昂尼达斯', topScorerGoals: 7, bestPlayer: '莱昂尼达斯', bestGoalkeeper: '普拉尼卡', totalGoals: 84, totalMatches: 18, totalAttendance: 375700, teamsCount: 15 },
  { year: 1950, host: '巴西', hostFlagCode: 'br', champion: '乌拉圭', championFlagCode: 'uy', runnerUp: '巴西', runnerUpFlagCode: 'br', thirdPlace: '瑞典', thirdPlaceFlagCode: 'se', fourthPlace: '西班牙', fourthPlaceFlagCode: 'es', topScorer: '阿德米尔', topScorerGoals: 9, bestPlayer: '济济尼奥', bestGoalkeeper: '巴博萨', totalGoals: 88, totalMatches: 22, totalAttendance: 1045246, teamsCount: 13 },
  { year: 1954, host: '瑞士', hostFlagCode: 'ch', champion: '西德', championFlagCode: 'de', runnerUp: '匈牙利', runnerUpFlagCode: 'hu', thirdPlace: '奥地利', thirdPlaceFlagCode: 'at', fourthPlace: '乌拉圭', fourthPlaceFlagCode: 'uy', topScorer: '柯奇士', topScorerGoals: 11, bestPlayer: '普斯卡什', bestGoalkeeper: '格罗希奇', totalGoals: 140, totalMatches: 26, totalAttendance: 768607, teamsCount: 16 },
  { year: 1958, host: '瑞典', hostFlagCode: 'se', champion: '巴西', championFlagCode: 'br', runnerUp: '瑞典', runnerUpFlagCode: 'se', thirdPlace: '法国', thirdPlaceFlagCode: 'fr', fourthPlace: '西德', fourthPlaceFlagCode: 'de', topScorer: '方丹', topScorerGoals: 13, bestPlayer: '贝利', bestGoalkeeper: '雅辛', totalGoals: 126, totalMatches: 35, totalAttendance: 819810, teamsCount: 16 },
  { year: 1962, host: '智利', hostFlagCode: 'cl', champion: '巴西', championFlagCode: 'br', runnerUp: '捷克斯洛伐克', runnerUpFlagCode: 'cz', thirdPlace: '智利', thirdPlaceFlagCode: 'cl', fourthPlace: '南斯拉夫', fourthPlaceFlagCode: 'rs', topScorer: '加林查', topScorerGoals: 4, bestPlayer: '加林查', bestGoalkeeper: '施罗伊夫', totalGoals: 89, totalMatches: 32, totalAttendance: 893172, teamsCount: 16 },
  { year: 1966, host: '英格兰', hostFlagCode: 'gb', champion: '英格兰', championFlagCode: 'gb', runnerUp: '西德', runnerUpFlagCode: 'de', thirdPlace: '葡萄牙', thirdPlaceFlagCode: 'pt', fourthPlace: '苏联', fourthPlaceFlagCode: 'ru', topScorer: '尤西比奥', topScorerGoals: 9, bestPlayer: '查尔顿', bestGoalkeeper: '班克斯', totalGoals: 89, totalMatches: 32, totalAttendance: 1563135, teamsCount: 16 },
  { year: 1970, host: '墨西哥', hostFlagCode: 'mx', champion: '巴西', championFlagCode: 'br', runnerUp: '意大利', runnerUpFlagCode: 'it', thirdPlace: '西德', thirdPlaceFlagCode: 'de', fourthPlace: '乌拉圭', fourthPlaceFlagCode: 'uy', topScorer: '盖德·穆勒', topScorerGoals: 10, bestPlayer: '贝利', bestGoalkeeper: '马祖尔凯维奇', totalGoals: 95, totalMatches: 32, totalAttendance: 1603975, teamsCount: 16 },
  { year: 1974, host: '西德', hostFlagCode: 'de', champion: '西德', championFlagCode: 'de', runnerUp: '荷兰', runnerUpFlagCode: 'nl', thirdPlace: '波兰', thirdPlaceFlagCode: 'pl', fourthPlace: '巴西', fourthPlaceFlagCode: 'br', topScorer: '拉托', topScorerGoals: 7, bestPlayer: '克鲁伊夫', bestGoalkeeper: '迈耶', totalGoals: 97, totalMatches: 38, totalAttendance: 1774022, teamsCount: 16 },
  { year: 1978, host: '阿根廷', hostFlagCode: 'ar', champion: '阿根廷', championFlagCode: 'ar', runnerUp: '荷兰', runnerUpFlagCode: 'nl', thirdPlace: '巴西', thirdPlaceFlagCode: 'br', fourthPlace: '意大利', fourthPlaceFlagCode: 'it', topScorer: '肯佩斯', topScorerGoals: 6, bestPlayer: '肯佩斯', bestGoalkeeper: '菲洛尔', totalGoals: 102, totalMatches: 38, totalAttendance: 1545791, teamsCount: 16 },
  { year: 1982, host: '西班牙', hostFlagCode: 'es', champion: '意大利', championFlagCode: 'it', runnerUp: '西德', runnerUpFlagCode: 'de', thirdPlace: '波兰', thirdPlaceFlagCode: 'pl', fourthPlace: '法国', fourthPlaceFlagCode: 'fr', topScorer: '罗西', topScorerGoals: 6, bestPlayer: '罗西', bestGoalkeeper: '佐夫', totalGoals: 146, totalMatches: 52, totalAttendance: 2109723, teamsCount: 24 },
  { year: 1986, host: '墨西哥', hostFlagCode: 'mx', champion: '阿根廷', championFlagCode: 'ar', runnerUp: '西德', runnerUpFlagCode: 'de', thirdPlace: '法国', thirdPlaceFlagCode: 'fr', fourthPlace: '比利时', fourthPlaceFlagCode: 'be', topScorer: '莱因克尔', topScorerGoals: 6, bestPlayer: '马拉多纳', bestGoalkeeper: '舒马赫', totalGoals: 132, totalMatches: 52, totalAttendance: 2394031, teamsCount: 24 },
  { year: 1990, host: '意大利', hostFlagCode: 'it', champion: '西德', championFlagCode: 'de', runnerUp: '阿根廷', runnerUpFlagCode: 'ar', thirdPlace: '意大利', thirdPlaceFlagCode: 'it', fourthPlace: '英格兰', fourthPlaceFlagCode: 'gb', topScorer: '斯基拉奇', topScorerGoals: 6, bestPlayer: '斯基拉奇', bestGoalkeeper: '戈耶切亚', totalGoals: 115, totalMatches: 52, totalAttendance: 2516215, teamsCount: 24 },
  { year: 1994, host: '美国', hostFlagCode: 'us', champion: '巴西', championFlagCode: 'br', runnerUp: '意大利', runnerUpFlagCode: 'it', thirdPlace: '瑞典', thirdPlaceFlagCode: 'se', fourthPlace: '保加利亚', fourthPlaceFlagCode: 'bg', topScorer: '斯托伊奇科夫', topScorerGoals: 6, bestPlayer: '罗马里奥', bestGoalkeeper: '普雷德霍姆', totalGoals: 141, totalMatches: 52, totalAttendance: 3587538, teamsCount: 24 },
  { year: 1998, host: '法国', hostFlagCode: 'fr', champion: '法国', championFlagCode: 'fr', runnerUp: '巴西', runnerUpFlagCode: 'br', thirdPlace: '克罗地亚', thirdPlaceFlagCode: 'hr', fourthPlace: '荷兰', fourthPlaceFlagCode: 'nl', topScorer: '苏克', topScorerGoals: 6, bestPlayer: '罗纳尔多', bestGoalkeeper: '巴特斯', totalGoals: 171, totalMatches: 64, totalAttendance: 2785100, teamsCount: 32 },
  { year: 2002, host: '韩国/日本', hostFlagCode: 'kr', champion: '巴西', championFlagCode: 'br', runnerUp: '德国', runnerUpFlagCode: 'de', thirdPlace: '土耳其', thirdPlaceFlagCode: 'tr', fourthPlace: '韩国', fourthPlaceFlagCode: 'kr', topScorer: '罗纳尔多', topScorerGoals: 8, bestPlayer: '卡恩', bestGoalkeeper: '卡恩', totalGoals: 161, totalMatches: 64, totalAttendance: 2705197, teamsCount: 32 },
  { year: 2006, host: '德国', hostFlagCode: 'de', champion: '意大利', championFlagCode: 'it', runnerUp: '法国', runnerUpFlagCode: 'fr', thirdPlace: '德国', thirdPlaceFlagCode: 'de', fourthPlace: '葡萄牙', fourthPlaceFlagCode: 'pt', topScorer: '克洛泽', topScorerGoals: 5, bestPlayer: '齐达内', bestGoalkeeper: '布冯', totalGoals: 147, totalMatches: 64, totalAttendance: 3359439, teamsCount: 32 },
  { year: 2010, host: '南非', hostFlagCode: 'za', champion: '西班牙', championFlagCode: 'es', runnerUp: '荷兰', runnerUpFlagCode: 'nl', thirdPlace: '德国', thirdPlaceFlagCode: 'de', fourthPlace: '乌拉圭', fourthPlaceFlagCode: 'uy', topScorer: '托马斯·穆勒', topScorerGoals: 5, bestPlayer: '弗兰', bestGoalkeeper: '卡西利亚斯', totalGoals: 145, totalMatches: 64, totalAttendance: 3178856, teamsCount: 32 },
  { year: 2014, host: '巴西', hostFlagCode: 'br', champion: '德国', championFlagCode: 'de', runnerUp: '阿根廷', runnerUpFlagCode: 'ar', thirdPlace: '荷兰', thirdPlaceFlagCode: 'nl', fourthPlace: '巴西', fourthPlaceFlagCode: 'br', topScorer: 'J罗', topScorerGoals: 6, bestPlayer: '梅西', bestGoalkeeper: '诺伊尔', totalGoals: 171, totalMatches: 64, totalAttendance: 3429873, teamsCount: 32 },
  { year: 2018, host: '俄罗斯', hostFlagCode: 'ru', champion: '法国', championFlagCode: 'fr', runnerUp: '克罗地亚', runnerUpFlagCode: 'hr', thirdPlace: '比利时', thirdPlaceFlagCode: 'be', fourthPlace: '英格兰', fourthPlaceFlagCode: 'gb', topScorer: '凯恩', topScorerGoals: 6, bestPlayer: '莫德里奇', bestGoalkeeper: '库尔图瓦', totalGoals: 169, totalMatches: 64, totalAttendance: 3031768, teamsCount: 32 },
  { year: 2022, host: '卡塔尔', hostFlagCode: 'qa', champion: '阿根廷', championFlagCode: 'ar', runnerUp: '法国', runnerUpFlagCode: 'fr', thirdPlace: '克罗地亚', thirdPlaceFlagCode: 'hr', fourthPlace: '摩洛哥', fourthPlaceFlagCode: 'ma', topScorer: '姆巴佩', topScorerGoals: 8, bestPlayer: '梅西', bestGoalkeeper: '马丁内斯', totalGoals: 172, totalMatches: 64, totalAttendance: 3404252, teamsCount: 32 },
]

const insertTournament = db.prepare(
  `INSERT OR REPLACE INTO tournaments (year, host, host_flag_code, champion, champion_flag_code, runner_up, runner_up_flag_code, third_place, third_place_flag_code, fourth_place, fourth_place_flag_code, top_scorer, top_scorer_goals, best_player, best_goalkeeper, total_goals, total_matches, total_attendance, teams_count)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
)

for (const t of tournaments) {
  insertTournament.run(t.year, t.host, t.hostFlagCode, t.champion, t.championFlagCode, t.runnerUp, t.runnerUpFlagCode, t.thirdPlace, t.thirdPlaceFlagCode, t.fourthPlace, t.fourthPlaceFlagCode, t.topScorer, t.topScorerGoals, t.bestPlayer, t.bestGoalkeeper, t.totalGoals, t.totalMatches, t.totalAttendance, t.teamsCount)
}

const records = [
  { id: 'r1', title: '最多冠军', description: '巴西 - 5次夺冠', detail: '巴西在1958、1962、1970、1994、2002年五次夺得世界杯冠军。', category: 'team' },
  { id: 'r2', title: '单届最多进球', description: '1954年瑞士世界杯 - 140球', detail: '1954年瑞士世界杯共打入140球，场均5.38球。', category: 'tournament' },
  { id: 'r3', title: '最快进球', description: '哈坎·苏克 - 11秒（2002年）', detail: '2002年三四名决赛，土耳其前锋哈坎·苏克在开场仅11秒就攻破韩国队大门。', category: 'player' },
  { id: 'r4', title: '个人最多进球', description: '克洛泽 - 16球', detail: '德国前锋米罗斯拉夫·克洛泽在四届世界杯中共打入16球。', category: 'player' },
  { id: 'r5', title: '单场最多进球', description: '奥地利7-5瑞士（1954年）', detail: '1954年世界杯四分之一决赛，奥地利7-5战胜瑞士，合计12球。', category: 'match' },
]

const insertRecord = db.prepare(
  'INSERT OR REPLACE INTO world_cup_records (id, title, description, detail, category) VALUES (?, ?, ?, ?, ?)'
)
for (const r of records) {
  insertRecord.run(r.id, r.title, r.description, r.detail, r.category)
}

console.log('Seed 完成：场地、历届世界杯、纪录已写入')
