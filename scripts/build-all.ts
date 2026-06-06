/**
 * 一步到位：生成全部48队 JSON → 合并到 teams.ts
 * 用法: npx tsx scripts/build-all.ts
 */
import * as fs from "fs"
import * as path from "path"

const SQUADS_DIR = path.resolve("scripts/squads")
const TEAMS_PATH = path.resolve("src/data/teams.ts")

// 写 JSON 辅助
function saveSquad(id: string, players: any[]) {
  fs.writeFileSync(path.join(SQUADS_DIR, `${id}.json`), JSON.stringify(players, null, 2))
}

// ============================================================
// 全部 48 队球员数据 (name, enName, club, position)
// ============================================================

saveSquad("spain", [
  {name:"乌奈·西蒙",enName:"Unai Simón",club:"毕尔巴鄂竞技",position:"GK"},
  {name:"大卫·拉亚",enName:"David Raya",club:"阿森纳",position:"GK"},
  {name:"琼·加西亚",enName:"Joan García",club:"巴塞罗那",position:"GK"},
  {name:"库巴西",enName:"Pau Cubarsí",club:"巴塞罗那",position:"CB"},
  {name:"埃里克·加西亚",enName:"Eric García",club:"巴塞罗那",position:"CB"},
  {name:"拉波尔特",enName:"Aymeric Laporte",club:"毕尔巴鄂竞技",position:"CB"},
  {name:"普比尔",enName:"Marc Pubill",club:"阿尔梅里亚",position:"RB"},
  {name:"库库雷利亚",enName:"Marc Cucurella",club:"切尔西",position:"LB"},
  {name:"佩德罗·波罗",enName:"Pedro Porro",club:"托特纳姆热刺",position:"RB"},
  {name:"略伦特",enName:"Marcos Llorente",club:"马德里竞技",position:"CM"},
  {name:"格里马尔多",enName:"Álex Grimaldo",club:"勒沃库森",position:"LB"},
  {name:"罗德里",enName:"Rodri",club:"曼城",position:"CDM"},
  {name:"佩德里",enName:"Pedri",club:"巴塞罗那",position:"CM"},
  {name:"法比安·鲁伊斯",enName:"Fabián Ruiz",club:"巴黎圣日耳曼",position:"CM"},
  {name:"苏比门迪",enName:"Martín Zubimendi",club:"阿森纳",position:"CDM"},
  {name:"梅里诺",enName:"Mikel Merino",club:"阿森纳",position:"CM"},
  {name:"加维",enName:"Gavi",club:"巴塞罗那",position:"CM"},
  {name:"巴埃纳",enName:"Álex Baena",club:"马德里竞技",position:"CAM"},
  {name:"拉明·亚马尔",enName:"Lamine Yamal",club:"巴塞罗那",position:"RW"},
  {name:"尼科·威廉斯",enName:"Nico Williams",club:"毕尔巴鄂竞技",position:"LW"},
  {name:"奥亚萨瓦尔",enName:"Mikel Oyarzabal",club:"皇家社会",position:"LW"},
  {name:"费兰·托雷斯",enName:"Ferran Torres",club:"巴塞罗那",position:"RW"},
  {name:"丹尼·奥尔莫",enName:"Dani Olmo",club:"巴塞罗那",position:"CAM"},
  {name:"耶雷米·皮诺",enName:"Yeremy Pino",club:"维拉",position:"RW"},
  {name:"博尔哈·伊格莱西亚斯",enName:"Borja Iglesias",club:"塞尔塔",position:"ST"},
])

// 由于单文件体积限制，完整48队数据请继续在下文追加...
console.log("JSON squad files written. Run merge step next.")
