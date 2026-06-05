// ============================================
// 2026世界杯各大洲预选赛数据
// 数据更新至2026年3月（所有附加赛已结束）
// ============================================

export interface QualifyingTeam {
  teamId: string
  teamName: string
  confederation: string
  qualificationMethod: string  // "东道主" | "小组头名" | "小组第二" | "附加赛" | "洲际附加赛"
  group?: string
  record?: string
  keyPlayers?: string[]
  notes?: string
}

export interface ConfederationSummary {
  name: string
  nameEn: string
  totalSpots: number
  qualifiedTeams: string[]
  qualificationFormat: string
}

// ============================================
// 各洲晋级球队数据
// ============================================

/** 亚洲区 (AFC) */
const afcTeams: QualifyingTeam[] = [
  {
    teamId: "japan",
    teamName: "日本",
    confederation: "AFC",
    qualificationMethod: "小组头名",
    group: "C组",
    record: "8胜2平0负",
    keyPlayers: ["三笘薰", "久保建英", "远藤航"],
    notes: "亚洲区预选赛成绩最佳，攻防俱佳，成为首支晋级2026世界杯的亚洲球队",
  },
  {
    teamId: "iran",
    teamName: "伊朗",
    confederation: "AFC",
    qualificationMethod: "小组头名",
    group: "A组",
    record: "7胜2平1负",
    keyPlayers: ["塔雷米", "阿兹蒙", "贾汉巴赫什"],
    notes: "连续第四届晋级世界杯，亚洲足球劲旅",
  },
  {
    teamId: "southkorea",
    teamName: "韩国",
    confederation: "AFC",
    qualificationMethod: "小组头名",
    group: "B组",
    record: "7胜3平0负",
    keyPlayers: ["孙兴慜", "李刚仁", "金玟哉"],
    notes: "连续第11次晋级世界杯，孙兴慜领衔的黄金一代",
  },
  {
    teamId: "uzbekistan",
    teamName: "乌兹别克斯坦",
    confederation: "AFC",
    qualificationMethod: "小组第二",
    group: "A组",
    record: "6胜2平2负",
    keyPlayers: ["肖穆罗多夫", "马沙里波夫", "哈姆罗别科夫"],
    notes: "历史首次晋级世界杯，创造了乌兹别克斯坦足球新篇章",
  },
  {
    teamId: "jordan",
    teamName: "约旦",
    confederation: "AFC",
    qualificationMethod: "小组第二",
    group: "B组",
    record: "5胜3平2负",
    keyPlayers: ["塔马里", "纳伊马特", "阿拉布"],
    notes: "首次晋级世界杯，2023亚洲杯亚军后展现出强劲上升势头",
  },
  {
    teamId: "australia",
    teamName: "澳大利亚",
    confederation: "AFC",
    qualificationMethod: "小组第二",
    group: "C组",
    record: "5胜4平1负",
    keyPlayers: ["瑞安", "苏塔", "古德温"],
    notes: "连续第六届晋级世界杯，亚足联老牌劲旅",
  },
  {
    teamId: "saudiarabia",
    teamName: "沙特阿拉伯",
    confederation: "AFC",
    qualificationMethod: "小组第二",
    group: "A组",
    record: "5胜2平3负",
    keyPlayers: ["谢赫里", "卡努", "奥韦斯"],
    notes: "力压阿联酋出线，沙特联赛的崛起为国家队提供了强劲支撑",
  },
  {
    teamId: "qatar",
    teamName: "卡塔尔",
    confederation: "AFC",
    qualificationMethod: "小组第二",
    group: "B组",
    record: "5胜3平2负",
    keyPlayers: ["阿菲夫", "阿里", "巴沙姆"],
    notes: "2022世界杯东道主后首次通过预选赛晋级，证明了实力",
  },
  {
    teamId: "iraq",
    teamName: "伊拉克",
    confederation: "AFC",
    qualificationMethod: "洲际附加赛",
    group: "C组",
    record: "4胜3平3负",
    keyPlayers: ["阿里·贾西姆", "艾曼·侯赛因", "扎伊丹·伊克巴尔"],
    notes: "洲际附加赛击败玻利维亚后晋级，时隔40年重返世界杯舞台",
  },
]

/** 非洲区 (CAF) */
const cafTeams: QualifyingTeam[] = [
  {
    teamId: "egypt",
    teamName: "埃及",
    confederation: "CAF",
    qualificationMethod: "小组头名",
    group: "A组",
    record: "6胜0平0负",
    keyPlayers: ["萨拉赫", "马尔穆什", "埃尔舍纳维"],
    notes: "小组赛全胜晋级，萨拉赫与马尔穆什组成非洲最强攻击线",
  },
  {
    teamId: "senegal",
    teamName: "塞内加尔",
    confederation: "CAF",
    qualificationMethod: "小组头名",
    group: "B组",
    record: "5胜1平0负",
    keyPlayers: ["马内", "库利巴利", "尼古拉·杰克逊"],
    notes: "非洲区排名第一的种子队，连续第四届晋级世界杯",
  },
  {
    teamId: "southafrica",
    teamName: "南非",
    confederation: "CAF",
    qualificationMethod: "小组头名",
    group: "C组",
    record: "4胜1平1负",
    keyPlayers: ["罗恩·威廉姆斯", "莫科纳", "陶"],
    notes: "2010世界杯东道主后再度晋级，南部非洲足球复兴的标志",
  },
  {
    teamId: "capeverde",
    teamName: "佛得角",
    confederation: "CAF",
    qualificationMethod: "小组头名",
    group: "D组",
    record: "4胜2平0负",
    keyPlayers: ["瑞安·门德斯", "贝贝", "洛佩斯"],
    notes: "小国奇迹！人口不足60万的岛国首次晋级世界杯",
  },
  {
    teamId: "morocco",
    teamName: "摩洛哥",
    confederation: "CAF",
    qualificationMethod: "小组头名",
    group: "E组",
    record: "6胜0平0负",
    keyPlayers: ["哈基米", "卜拉欣·迪亚斯", "布努"],
    notes: "2022世界杯四强球队，非洲足球的旗帜，预选赛六战全胜",
  },
  {
    teamId: "ivorycoast",
    teamName: "科特迪瓦",
    confederation: "CAF",
    qualificationMethod: "小组头名",
    group: "F组",
    record: "5胜0平1负",
    keyPlayers: ["阿莱", "弗法纳", "弗法纳·韦斯利"],
    notes: "2023非洲杯冠军得主，新一代科特迪瓦球员崭露头角",
  },
  {
    teamId: "algeria",
    teamName: "阿尔及利亚",
    confederation: "CAF",
    qualificationMethod: "小组头名",
    group: "G组",
    record: "5胜1平0负",
    keyPlayers: ["马赫雷斯", "本纳塞尔", "奥亚尔"],
    notes: "阿尔及利亚黄金一代的绝唱，马赫雷斯领衔力争突破",
  },
  {
    teamId: "tunisia",
    teamName: "突尼斯",
    confederation: "CAF",
    qualificationMethod: "小组头名",
    group: "H组",
    record: "5胜0平1负",
    keyPlayers: ["姆萨克尼", "达门", "斯利蒂"],
    notes: "连续多届晋级，非洲最稳定的球队之一",
  },
  {
    teamId: "ghana",
    teamName: "加纳",
    confederation: "CAF",
    qualificationMethod: "小组头名",
    group: "I组",
    record: "4胜1平1负",
    keyPlayers: ["库杜斯", "帕尔特伊", "阿蒂齐吉"],
    notes: "非洲足球传统劲旅，年轻球员库杜斯成为新核心",
  },
  {
    teamId: "drcongo",
    teamName: "刚果民主共和国",
    confederation: "CAF",
    qualificationMethod: "洲际附加赛",
    group: "B组",
    record: "3胜2平1负",
    keyPlayers: ["巴坎布", "姆博拉", "卡延贝"],
    notes: "洲际附加赛击败牙买加后晋级，非洲足球深度进一步增强",
  },
]

/** 中北美区 (CONCACAF) */
const concacafTeams: QualifyingTeam[] = [
  {
    teamId: "usa",
    teamName: "美国",
    confederation: "CONCACAF",
    qualificationMethod: "东道主",
    notes: "联合东道主之一，自动获得参赛资格。2022世界杯十六强，青训体系持续产出优秀球员",
  },
  {
    teamId: "canada",
    teamName: "加拿大",
    confederation: "CONCACAF",
    qualificationMethod: "东道主",
    notes: "联合东道主之一，自动获得参赛资格。2022世界杯后足球热情空前高涨",
  },
  {
    teamId: "mexico",
    teamName: "墨西哥",
    confederation: "CONCACAF",
    qualificationMethod: "东道主",
    notes: "联合东道主之一，自动获得参赛资格。三次主办世界杯创造历史纪录",
  },
  {
    teamId: "panama",
    teamName: "巴拿马",
    confederation: "CONCACAF",
    qualificationMethod: "小组前二",
    record: "8胜1平1负",
    keyPlayers: ["罗德里格斯", "梅希亚", "卡拉斯基利亚"],
    notes: "中北美区预选赛表现最出色，第二次晋级世界杯",
  },
  {
    teamId: "curacao",
    teamName: "库拉索",
    confederation: "CONCACAF",
    qualificationMethod: "小组前二",
    record: "7胜1平2负",
    keyPlayers: ["巴佐尔", "巴库纳", "扬加"],
    notes: "历史首次晋级世界杯！库拉索岛的足球童话",
  },
  {
    teamId: "haiti",
    teamName: "海地",
    confederation: "CONCACAF",
    qualificationMethod: "小组前二",
    record: "7胜0平3负",
    keyPlayers: ["皮埃尔", "阿德", "克里斯蒂安"],
    notes: "时隔多年重返世界杯，海地足球的重大突破",
  },
  {
    teamId: "jamaica",
    teamName: "牙买加",
    confederation: "CONCACAF",
    qualificationMethod: "附加赛未晋级",
    record: "5胜2平3负",
    keyPlayers: ["安东尼奥", "贝利", "布莱克"],
    notes: "洲际附加赛中不敌刚果民主共和国，遗憾无缘正赛",
  },
  {
    teamId: "suriname",
    teamName: "苏里南",
    confederation: "CONCACAF",
    qualificationMethod: "附加赛未晋级",
    record: "4胜3平3负",
    keyPlayers: ["贝克", "唐克", "范迪克·S"],
    notes: "曾有机会创造历史，附加赛中惜败于玻利维亚",
  },
]

/** 南美区 (CONMEBOL) */
const conmebolTeams: QualifyingTeam[] = [
  {
    teamId: "argentina",
    teamName: "阿根廷",
    confederation: "CONMEBOL",
    qualificationMethod: "小组前六",
    record: "10胜3平1负",
    keyPlayers: ["梅西", "阿尔瓦雷斯", "恩佐·费尔南德斯"],
    notes: "2022世界杯冠军，南美区预选赛头名出线，卫冕之路备受关注",
  },
  {
    teamId: "ecuador",
    teamName: "厄瓜多尔",
    confederation: "CONMEBOL",
    qualificationMethod: "小组前六",
    record: "7胜6平1负",
    keyPlayers: ["凯塞多", "埃斯图皮尼安", "多明格斯"],
    notes: "年轻阵容表现出色，凯塞多成为南美最炙手可热的中场",
  },
  {
    teamId: "colombia",
    teamName: "哥伦比亚",
    confederation: "CONMEBOL",
    qualificationMethod: "小组前六",
    record: "7胜5平2负",
    keyPlayers: ["路易斯·迪亚斯", "哈梅斯·罗德里格斯", "达文森·桑切斯"],
    notes: "路易斯·迪亚斯领衔的新一代哥伦比亚重返世界杯舞台",
  },
  {
    teamId: "uruguay",
    teamName: "乌拉圭",
    confederation: "CONMEBOL",
    qualificationMethod: "小组前六",
    record: "7胜4平3负",
    keyPlayers: ["巴尔韦德", "努涅斯", "阿劳霍"],
    notes: "贝尔萨执教下的乌拉圭焕发新生，巴尔韦德成为世界级中场",
  },
  {
    teamId: "brazil",
    teamName: "巴西",
    confederation: "CONMEBOL",
    qualificationMethod: "小组前六",
    record: "7胜3平4负",
    keyPlayers: ["维尼修斯", "罗德里戈", "吉马良斯"],
    notes: "预选赛过程有些波折但最终顺利晋级，维尼修斯成为锋线核心",
  },
  {
    teamId: "paraguay",
    teamName: "巴拉圭",
    confederation: "CONMEBOL",
    qualificationMethod: "小组前六",
    record: "5胜5平4负",
    keyPlayers: ["阿尔米隆", "索萨", "恩西索"],
    notes: "重返世界杯，阿尔米隆与恩西索领衔新一代巴拉圭球员",
  },
  {
    teamId: "bolivia",
    teamName: "玻利维亚",
    confederation: "CONMEBOL",
    qualificationMethod: "附加赛未晋级",
    record: "4胜3平7负",
    keyPlayers: ["莫雷诺", "瓦卡", "兰佩"],
    notes: "高原主场优势未能延续，洲际附加赛中不敌伊拉克无缘正赛",
  },
]

/** 大洋洲区 (OFC) */
const ofcTeams: QualifyingTeam[] = [
  {
    teamId: "newzealand",
    teamName: "新西兰",
    confederation: "OFC",
    qualificationMethod: "小组头名",
    record: "5胜0平0负",
    keyPlayers: ["伍德", "卡卡塞", "赛尔"],
    notes: "大洋洲区霸主，连续多届晋级世界杯，伍德是锋线支柱",
  },
  {
    teamId: "newcaledonia",
    teamName: "新喀里多尼亚",
    confederation: "OFC",
    qualificationMethod: "附加赛未晋级",
    record: "3胜1平1负",
    keyPlayers: ["卡伊", "瓦诺克", "博阿"],
    notes: "大洋洲区附加赛惜败，未能实现首次晋级世界杯的梦想",
  },
]

/** 欧洲区 (UEFA) */
const uefaTeams: QualifyingTeam[] = [
  {
    teamId: "germany",
    teamName: "德国",
    confederation: "UEFA",
    qualificationMethod: "小组头名",
    group: "A组",
    record: "8胜1平1负",
    keyPlayers: ["穆西亚拉", "维尔茨", "基米希"],
    notes: "2024欧洲杯后的德国队焕然一新，青年才俊层出不穷",
  },
  {
    teamId: "switzerland",
    teamName: "瑞士",
    confederation: "UEFA",
    qualificationMethod: "小组头名",
    group: "B组",
    record: "6胜3平1负",
    keyPlayers: ["阿坎吉", "扎卡", "索默"],
    notes: "稳定的表现确保小组头名，瑞士足球的黄金时代延续",
  },
  {
    teamId: "scotland",
    teamName: "苏格兰",
    confederation: "UEFA",
    qualificationMethod: "小组头名",
    group: "C组",
    record: "7胜1平2负",
    keyPlayers: ["罗伯逊", "麦克托米奈", "麦金"],
    notes: "力压各路劲旅获得小组头名，苏格兰足球迎来复兴",
  },
  {
    teamId: "france",
    teamName: "法国",
    confederation: "UEFA",
    qualificationMethod: "小组头名",
    group: "D组",
    record: "8胜2平0负",
    keyPlayers: ["姆巴佩", "格列兹曼", "萨利巴"],
    notes: "2022世界杯亚军，预选赛表现统治级，姆巴佩冲击生涯首座世界杯",
  },
  {
    teamId: "spain",
    teamName: "西班牙",
    confederation: "UEFA",
    qualificationMethod: "小组头名",
    group: "E组",
    record: "9胜0平1负",
    keyPlayers: ["亚马尔", "罗德里", "佩德里"],
    notes: "2024欧洲杯冠军得主，亚马尔成为世界足坛最炙手可热的新星",
  },
  {
    teamId: "portugal",
    teamName: "葡萄牙",
    confederation: "UEFA",
    qualificationMethod: "小组头名",
    group: "F组",
    record: "8胜1平1负",
    keyPlayers: ["C罗", "B费", "莱奥"],
    notes: "C罗的最后一届世界杯？葡萄牙黄金一代力争最高荣誉",
  },
  {
    teamId: "netherlands",
    teamName: "荷兰",
    confederation: "UEFA",
    qualificationMethod: "小组头名",
    group: "G组",
    record: "7胜2平1负",
    keyPlayers: ["范戴克", "加克波", "德容"],
    notes: "范戴克领衔的荷兰队防守稳固，力争打破世界杯无冠魔咒",
  },
  {
    teamId: "austria",
    teamName: "奥地利",
    confederation: "UEFA",
    qualificationMethod: "小组头名",
    group: "H组",
    record: "6胜3平1负",
    keyPlayers: ["萨比策", "阿拉巴", "彭茨"],
    notes: "连续多届晋级，奥地利足球进入稳定上升期",
  },
  {
    teamId: "norway",
    teamName: "挪威",
    confederation: "UEFA",
    qualificationMethod: "小组头名",
    group: "I组",
    record: "7胜2平1负",
    keyPlayers: ["哈兰德", "厄德高", "尼兰"],
    notes: "哈兰德+厄德高双星闪耀，重返世界杯舞台的挪威队备受期待",
  },
  {
    teamId: "belgium",
    teamName: "比利时",
    confederation: "UEFA",
    qualificationMethod: "小组头名",
    group: "J组",
    record: "7胜2平1负",
    keyPlayers: ["德布劳内", "卢卡库", "多库"],
    notes: "黄金一代的最后一舞，德布劳内力争为比利时带来首座世界冠军",
  },
  {
    teamId: "england",
    teamName: "英格兰",
    confederation: "UEFA",
    qualificationMethod: "小组头名",
    group: "K组",
    record: "8胜1平1负",
    keyPlayers: ["凯恩", "贝林厄姆", "福登"],
    notes: "贝林厄姆成为新核心，英格兰队力争超越2022八强成绩",
  },
  {
    teamId: "croatia",
    teamName: "克罗地亚",
    confederation: "UEFA",
    qualificationMethod: "小组头名",
    group: "L组",
    record: "6胜3平1负",
    keyPlayers: ["莫德里奇", "格瓦迪奥尔", "科瓦契奇"],
    notes: "莫德里奇的最后一届世界杯，2018亚军2022季军力争圆满收官",
  },
  // 附加赛晋级
  {
    teamId: "bosnia",
    teamName: "波黑",
    confederation: "UEFA",
    qualificationMethod: "附加赛",
    group: "A组",
    record: "5胜2平3负（小组第二），附加赛晋级",
    keyPlayers: ["哲科", "皮亚尼奇", "德米罗维奇"],
    notes: "附加赛A组击败意大利后晋级，时隔多年重返世界杯，哲科老当益壮",
  },
  {
    teamId: "sweden",
    teamName: "瑞典",
    confederation: "UEFA",
    qualificationMethod: "附加赛",
    group: "B组",
    record: "5胜2平3负（小组第二），附加赛晋级",
    keyPlayers: ["伊萨克", "库卢塞夫斯基", "奥尔森"],
    notes: "附加赛B组突围，伊萨克与库卢塞夫斯基领衔的攻击组合令人期待",
  },
  {
    teamId: "turkey",
    teamName: "土耳其",
    confederation: "UEFA",
    qualificationMethod: "附加赛",
    group: "C组",
    record: "5胜3平2负（小组第二），附加赛晋级",
    keyPlayers: ["恰尔汗奥卢", "居莱尔", "伊尔马兹"],
    notes: "附加赛C组成功突围，居莱尔等年轻球员迅速成长",
  },
  {
    teamId: "czechia",
    teamName: "捷克",
    confederation: "UEFA",
    qualificationMethod: "附加赛",
    group: "D组",
    record: "4胜4平2负（小组第二），附加赛晋级",
    keyPlayers: ["绍切克", "希克", "曹法尔"],
    notes: "附加赛D组击败丹麦后晋级，绍切克与希克为核心的团队足球",
  },
]

// ============================================
// 各洲汇总数据
// ============================================

const afcSummary: ConfederationSummary = {
  name: "亚洲",
  nameEn: "AFC",
  totalSpots: 9,
  qualifiedTeams: ["japan", "iran", "southkorea", "uzbekistan", "jordan", "australia", "saudiarabia", "qatar", "iraq"],
  qualificationFormat: "18支球队分3组，每组6队进行主客场双循环，小组前二直接晋级（共6队），小组第三和第四进入附加赛，最终产生2个洲际附加赛名额，其中1队晋级",
}

const cafSummary: ConfederationSummary = {
  name: "非洲",
  nameEn: "CAF",
  totalSpots: 10,
  qualifiedTeams: ["egypt", "senegal", "southafrica", "capeverde", "morocco", "ivorycoast", "algeria", "tunisia", "ghana", "drcongo"],
  qualificationFormat: "54支球队分9组进行主客场双循环，9个小组头名直接晋级，最佳小组第二通过洲际附加赛晋级（共1个洲际附加赛名额）",
}

const concacafSummary: ConfederationSummary = {
  name: "中北美及加勒比",
  nameEn: "CONCACAF",
  totalSpots: 6,
  qualifiedTeams: ["usa", "canada", "mexico", "panama", "curacao", "haiti"],
  qualificationFormat: "32支球队分8组进行主客场双循环，小组前二晋级第二轮；第二轮12支球队分3组进行主客场双循环，小组头名直接晋级。东道主美国、加拿大、墨西哥自动获得资格。洲际附加赛名额2个均未晋级",
}

const conmebolSummary: ConfederationSummary = {
  name: "南美洲",
  nameEn: "CONMEBOL",
  totalSpots: 6,
  qualifiedTeams: ["argentina", "ecuador", "colombia", "uruguay", "brazil", "paraguay"],
  qualificationFormat: "10支球队进行主客场双循环大联赛（18轮），前六名直接晋级，第七名进入洲际附加赛（未晋级）",
}

const ofcSummary: ConfederationSummary = {
  name: "大洋洲",
  nameEn: "OFC",
  totalSpots: 1,
  qualifiedTeams: ["newzealand"],
  qualificationFormat: "11支球队经淘汰赛后进行小组赛+决赛，冠军直接晋级，亚军进入洲际附加赛（未晋级）",
}

const uefaSummary: ConfederationSummary = {
  name: "欧洲",
  nameEn: "UEFA",
  totalSpots: 16,
  qualifiedTeams: [
    "germany", "switzerland", "scotland", "france", "spain", "portugal",
    "netherlands", "austria", "norway", "belgium", "england", "croatia",
    "bosnia", "sweden", "turkey", "czechia",
  ],
  qualificationFormat: "55支球队分12组进行主客场双循环，12个小组头名直接晋级，4个小组第二通过附加赛晋级",
}

// ============================================
// 汇总导出
// ============================================

/** 所有晋级球队数据（含附加赛未晋级球队） */
export const qualifyingTeams: QualifyingTeam[] = [
  ...afcTeams,
  ...cafTeams,
  ...concacafTeams,
  ...conmebolTeams,
  ...ofcTeams,
  ...uefaTeams,
]

/** 各洲汇总数据 */
export const confederationSummaries: ConfederationSummary[] = [
  afcSummary,
  cafSummary,
  concacafSummary,
  conmebolSummary,
  ofcSummary,
  uefaSummary,
]

/** 根据teamId查找预选赛信息 */
export function getQualifyingInfo(teamId: string): QualifyingTeam | undefined {
  return qualifyingTeams.find((t) => t.teamId === teamId)
}

/** 根据洲际查找预选赛汇总 */
export function getConfederationSummary(confederation: string): ConfederationSummary | undefined {
  return confederationSummaries.find((s) => s.nameEn === confederation)
}

/** 仅已晋级的球队列表 */
export const qualifiedTeamIds: string[] = [
  ...afcSummary.qualifiedTeams,
  ...cafSummary.qualifiedTeams,
  ...concacafSummary.qualifiedTeams,
  ...conmebolSummary.qualifiedTeams,
  ...ofcSummary.qualifiedTeams,
  ...uefaSummary.qualifiedTeams,
]
