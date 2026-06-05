import type { Prediction, TeamPrediction } from '../types/prediction'

/**
 * 2026 世界杯夺冠热门球队预测
 *
 * 说明：由于2026世界杯抽签尚未进行，无法进行比赛级预测。
 * 以下为基于球队近期表现、阵容实力、历史战绩等因素的综合夺冠概率估算。
 *
 * 数据状态：simulated（模拟估算，非实际结果）
 * 模型：基于球队FIFA排名、近期战绩、阵容深度、历史大赛表现等维度加权计算。
 */

// 比赛级预测：对阵未确定前为空数组
export const predictions: Prediction[] = []

// 球队级夺冠概率预测：Top 10 热门球队
export const teamPredictions: TeamPrediction[] = [
  {
    teamId: 'france',
    teamName: '法国',
    winProbability: 18,
    dataStatus: 'simulated',
    keyFactors: [
      '姆巴佩正值巅峰期，速度与终结能力世界顶级',
      '阵容深度冠绝全球，三条线均有世界级球员储备',
      '近四届世界杯两进决赛（2018冠军、2022亚军），大赛经验丰富',
      '德尚执教体系成熟稳定，战术执行能力强',
      '中场卡马文加、楚阿梅尼等新生代已成长为世界级',
    ],
  },
  {
    teamId: 'brazil',
    teamName: '巴西',
    winProbability: 14,
    dataStatus: 'simulated',
    keyFactors: [
      '维尼修斯、罗德里戈双翼齐飞，进攻火力恐怖',
      '五届世界杯冠军，深厚的大赛底蕴',
      '恩德里克等新生代天才球员崛起，阵容年轻化',
      '南美预选赛表现强势，整体状态稳定',
      '中场控制力和进攻创造力均属世界顶级',
    ],
  },
  {
    teamId: 'argentina',
    teamName: '阿根廷',
    winProbability: 12,
    dataStatus: 'simulated',
    keyFactors: [
      '2022世界杯冠军、2024美洲杯冠军，近年大赛统治力极强',
      '梅西虽年龄增长但组织能力和关键球依然顶级',
      '斯卡洛尼打造的战术体系成熟，团队凝聚力强',
      '阿尔瓦雷斯、恩佐等中生代已撑起球队骨架',
      '防守端奥塔门迪和罗梅罗组合稳固',
    ],
  },
  {
    teamId: 'england',
    teamName: '英格兰',
    winProbability: 10,
    dataStatus: 'simulated',
    keyFactors: [
      '贝林厄姆已成为世界最佳中场之一，攻防俱佳',
      '哈里·凯恩进球效率稳定，大赛经验丰富',
      '福登、萨卡、帕尔默等新生代攻击手才华横溢',
      '近三届大赛两次进入决赛/四强，竞争力持续在线',
      '英超联赛的高强度为球员提供了顶级竞技环境',
    ],
  },
  {
    teamId: 'spain',
    teamName: '西班牙',
    winProbability: 10,
    dataStatus: 'simulated',
    keyFactors: [
      '2024欧洲杯冠军，战术体系成熟且富有创造力',
      '拉明·亚马尔、尼科·威廉姆斯双子星闪耀',
      '罗德里坐镇中场，传控体系世界最佳',
      '年轻阵容充满活力，技术流打法极具观赏性和实效性',
      '德拉富恩特执教风格契合球员特点',
    ],
  },
  {
    teamId: 'germany',
    teamName: '德国',
    winProbability: 9,
    dataStatus: 'simulated',
    keyFactors: [
      '穆西亚拉、维尔茨双核驱动，进攻创造力极强',
      '2024欧洲杯主场作战展现复苏势头',
      '德国足球青训体系持续输出高质量球员',
      '大赛底蕴深厚，四届世界杯冠军得主',
      '纳格尔斯曼战术理念先进，球队重建初见成效',
    ],
  },
  {
    teamId: 'portugal',
    teamName: '葡萄牙',
    winProbability: 7,
    dataStatus: 'simulated',
    keyFactors: [
      '阵容深度惊人，B费、B席、莱昂、迪亚斯等球星云集',
      'C罗虽年长但经验和领袖气质无可替代',
      '新生代球员井喷，人才储备不逊任何传统豪强',
      '近几届大赛表现稳定，竞争力持续提升',
      '战术灵活性高，可根据对手调整打法',
    ],
  },
  {
    teamId: 'netherlands',
    teamName: '荷兰',
    winProbability: 4,
    dataStatus: 'simulated',
    keyFactors: [
      '范戴克领衔的防线依然坚固，防守体系成熟',
      '加克波、西蒙斯等新生代攻击手进步明显',
      '中场德容的组织调度能力是战术核心',
      '近年大赛表现稳健，淘汰赛具备爆冷能力',
      '全攻全守传统与现代战术理念结合',
    ],
  },
  {
    teamId: 'italy',
    teamName: '意大利',
    winProbability: 3,
    dataStatus: 'simulated',
    keyFactors: [
      '连续无缘两届世界杯后回归，全队斗志高昂',
      '2020欧洲杯冠军底蕴犹在，防守传统深厚',
      '巴雷拉、基耶萨等中坚力量正值巅峰',
      '斯帕莱蒂战术造诣深厚，球队纪律性强',
      '意大利足球在逆境中往往能爆发出惊人战斗力',
    ],
  },
  {
    teamId: 'usa',
    teamName: '美国',
    winProbability: 2,
    dataStatus: 'simulated',
    keyFactors: [
      '2026世界杯东道主之一，主场作战优势巨大',
      '普利西奇、麦肯尼、巴洛贡等旅欧球员实力不俗',
      '近年来足球水平持续进步，年轻阵容充满活力',
      '美国体育科学和训练体系世界领先',
      '主场球迷支持和熟悉的环境是重要加分项',
    ],
  },
]
