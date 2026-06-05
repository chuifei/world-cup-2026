import type { Venue } from "@/types"

export const venues: Venue[] = [
  { id: "azteca", name: "阿兹特克体育场", city: "墨西哥城", country: "墨西哥", capacity: 87523, matches: 5, description: "历史悠久的传奇球场，曾举办1970年和1986年世界杯决赛。" },
  { id: "bbva", name: "BBVA体育场", city: "蒙特雷", country: "墨西哥", capacity: 53500, matches: 4, description: "现代化的足球专用球场，坐落在蒙特雷山脉背景下。" },
  { id: "akron", name: "阿克伦体育场", city: "瓜达拉哈拉", country: "墨西哥", capacity: 49850, matches: 4, description: "墨西哥最具特色的球场之一，拥有独特的建筑风格。" },
  { id: "metlife", name: "大都会人寿体育场", city: "纽约", country: "美国", capacity: 82500, matches: 6, description: "纽约地区的标志性体育场馆，将承办包括决赛在内的重要比赛。" },
  { id: "sofi", name: "SoFi体育场", city: "洛杉矶", country: "美国", capacity: 70240, matches: 5, description: "世界最先进的体育场之一，拥有巨型双面屏幕。" },
  { id: "hardrock", name: "硬石体育场", city: "迈阿密", country: "美国", capacity: 65326, matches: 5, description: "迈阿密花园的标志性体育场，承办过多届超级碗。" },
  { id: "att", name: "AT&T体育场", city: "达拉斯", country: "美国", capacity: 80000, matches: 5, description: "拥有可伸缩屋顶的巨型体育场，被誉为美国之队的主场。" },
  { id: "mercedes", name: "梅赛德斯-奔驰体育场", city: "亚特兰大", country: "美国", capacity: 71000, matches: 5, description: "超现代化体育场，拥有独特的可伸缩花瓣式屋顶。" },
  { id: "nrg", name: "NRG体育场", city: "休斯顿", country: "美国", capacity: 72220, matches: 4, description: "德克萨斯州最大的体育场之一，配备可伸缩屋顶。" },
  { id: "arrowhead", name: "箭头体育场", city: "堪萨斯城", country: "美国", capacity: 76416, matches: 4, description: "以狂热气氛著称的体育场，美国足球文化的重要地标。" },
  { id: "gillette", name: "吉列体育场", city: "波士顿", country: "美国", capacity: 65878, matches: 4, description: "新英格兰地区的顶级体育场馆。" },
  { id: "lincoln", name: "林肯金融体育场", city: "费城", country: "美国", capacity: 67594, matches: 4, description: "费城老鹰队主场，拥有绝佳的城市天际线景观。" },
  { id: "levis", name: "李维斯体育场", city: "旧金山", country: "美国", capacity: 68500, matches: 4, description: "硅谷核心地带的高科技体育场。" },
  { id: "lumen", name: "流明体育场", city: "西雅图", country: "美国", capacity: 68740, matches: 4, description: "西北太平洋地区的标志性体育场，拥有独特的声学设计。" },
  { id: "bmo", name: "BMO体育场", city: "多伦多", country: "加拿大", capacity: 45000, matches: 4, description: "加拿大最大的足球专用体育场之一。" },
  { id: "bcplace", name: "BC广场体育场", city: "温哥华", country: "加拿大", capacity: 54320, matches: 4, description: "拥有可伸缩缆绳支撑屋顶的独特建筑，温哥华地标。" },
]

export function getVenueById(id: string): Venue | undefined {
  return venues.find(v => v.id === id)
}

export function getVenuesByCountry(country: string): Venue[] {
  return venues.filter(v => v.country === country)
}
