// Hanzi Tangle - 词库
// 硬约束: 每个字的左右部件拆分必须存在于 CHAR_SPLITS

import { CHAR_SPLITS, WHOLE_CHAR_SET } from "./characters";

export interface HanziWord {
  word: string;
  hint: string;
  theme: string; // theme id
}

export const WORD_BANK: HanziWord[] = [
  // ---- nature 自然 ----
  { word: "江河", hint: "大水的总称", theme: "nature" },
  { word: "河水", hint: "河里流的水", theme: "nature" },
  { word: "湖水", hint: "湖里的水", theme: "nature" },
  { word: "海浪", hint: "大海的波浪", theme: "nature" },
  { word: "波浪", hint: "水面的起伏", theme: "nature" },
  { word: "清水", hint: "干净透明的水", theme: "nature" },
  { word: "热水", hint: "温度高的水", theme: "nature" },
  { word: "冷水", hint: "温度低的水", theme: "nature" },
  { word: "凉水", hint: "微凉的水", theme: "nature" },
  { word: "深水", hint: "很深的水域", theme: "nature" },
  { word: "浅水", hint: "不深的水", theme: "nature" },
  { word: "池塘", hint: "蓄水的小坑", theme: "nature" },
  { word: "池水", hint: "塘里的水", theme: "nature" },
  { word: "汽油", hint: "汽车喝的燃料", theme: "nature" },
  { word: "汽水", hint: "冒泡的饮料", theme: "nature" },
  { word: "温泉", hint: "热热的泉水", theme: "nature" },
  { word: "溪水", hint: "山间小水流", theme: "nature" },
  { word: "江水", hint: "大江里的水", theme: "nature" },
  { word: "海水", hint: "又咸又蓝的水", theme: "nature" },
  { word: "树林", hint: "很多树在一起", theme: "nature" },
  { word: "柳树", hint: "枝条垂下的树", theme: "nature" },
  { word: "桃树", hint: "结桃子的树", theme: "nature" },
  { word: "松树", hint: "四季常青的树", theme: "nature" },
  { word: "树枝", hint: "树干分出的部分", theme: "nature" },
  { word: "树根", hint: "长在土里的部分", theme: "nature" },
  { word: "山村", hint: "山里的村庄", theme: "nature" },
  { word: "村庄", hint: "乡下的聚落", theme: "nature" },
  { word: "积雪", hint: "堆积的白雪", theme: "nature" },
  // ---- weather / time 天气时间 ----
  { word: "晴天", hint: "太阳当空的日子", theme: "weather" },
  { word: "晴朗", hint: "阳光充足的天气", theme: "weather" },
  { word: "清晨", hint: "太阳刚升起时", theme: "weather" },
  { word: "早晨", hint: "一天的开头", theme: "weather" },
  { word: "晚安", hint: "睡前说的话", theme: "weather" },
  { word: "早上", hint: "上午的开始", theme: "weather" },
  { word: "明星", hint: "天上的红星/大名人", theme: "weather" },
  { word: "星星", hint: "夜空的小亮光", theme: "weather" },
  { word: "昨夜", hint: "昨天晚上", theme: "weather" },
  { word: "暖风", hint: "温暖的风", theme: "weather" },
  { word: "凉快", hint: "凉爽舒服的感觉", theme: "weather" },
  { word: "冰冷", hint: "非常寒冷", theme: "weather" },
  { word: "冰凉", hint: "很凉的感觉", theme: "weather" },
  { word: "时间", hint: "钟表测量的东西", theme: "weather" },
  { word: "时辰", hint: "古代的时间单位", theme: "weather" },
  { word: "今晚", hint: "今天夜里", theme: "weather" },
  { word: "明白", hint: "懂了的感受", theme: "weather" },
  // ---- family 家人 ----
  { word: "妈妈", hint: "生我们的人", theme: "family" },
  { word: "姐姐", hint: "年长的姐妹", theme: "family" },
  { word: "妹妹", hint: "年幼的姐妹", theme: "family" },
  { word: "姑姑", hint: "爸爸的姐妹", theme: "family" },
  { word: "姑娘", hint: "年轻的女子", theme: "family" },
  { word: "她们", hint: "称呼多位女性", theme: "family" },
  { word: "奶奶", hint: "爸爸的妈妈", theme: "family" },
  { word: "阿姨", hint: "妈妈的姐妹/称呼", theme: "family" },
  // ---- animals 动物 ----
  { word: "小狗", hint: "小型的狗", theme: "animals" },
  { word: "小猫", hint: "小型的猫", theme: "animals" },
  { word: "狼狗", hint: "像狼的狗", theme: "animals" },
  { word: "狮子", hint: "草原之王", theme: "animals" },
  { word: "猴子", hint: "爱爬树爱模仿", theme: "animals" },
  { word: "蚂蚁", hint: "搬食物的小昆虫", theme: "animals" },
  { word: "青蛙", hint: "呱呱叫的田鸡", theme: "animals" },
  { word: "虾米", hint: "小虾仁", theme: "animals" },
  { word: "鱼虾", hint: "水里的小生物", theme: "animals" },
  { word: "鲜鱼", hint: "新鲜的鱼", theme: "animals" },
  { word: "鲤鱼", hint: "跳龙门的鱼", theme: "animals" },
  { word: "公鸡", hint: "喔喔叫的鸡", theme: "animals" },
  { word: "母鸡", hint: "下蛋的鸡", theme: "animals" },
  { word: "小鸡", hint: "毛茸茸的鸡宝宝", theme: "animals" },
  { word: "鸭子", hint: "嘎嘎叫的水鸟", theme: "animals" },
  // ---- food 食物 ----
  { word: "米饭", hint: "中国人主食", theme: "food" },
  { word: "炒饭", hint: "锅里炒的米饭", theme: "food" },
  { word: "米饼", hint: "米做的饼", theme: "food" },
  { word: "饺子", hint: "过年吃的面食", theme: "food" },
  { word: "吃饱", hint: "肚子满足了", theme: "food" },
  { word: "米糕", hint: "米做的糕点", theme: "food" },
  { word: "米粉", hint: "米磨成的粉", theme: "food" },
  { word: "糖果", hint: "甜甜的小零食", theme: "food" },
  { word: "红糖", hint: "褐色的糖", theme: "food" },
  { word: "白糖", hint: "白色的糖", theme: "food" },
  { word: "冰糖", hint: "块状的糖", theme: "food" },
  { word: "蛋糕", hint: "生日吃的点心", theme: "food" },
  { word: "好吃", hint: "味道很棒", theme: "food" },
  { word: "喝汤", hint: "喝碗里的汤", theme: "food" },
  { word: "热汤", hint: "热乎乎的汤", theme: "food" },
  { word: "炒菜", hint: "锅铲翻动的菜", theme: "food" },
  // ---- action 动作 ----
  { word: "打扫", hint: "扫地擦灰", theme: "action" },
  { word: "拍打", hint: "用手轻拍", theme: "action" },
  { word: "拉手", hint: "手牵着手", theme: "action" },
  { word: "推车", hint: "推着小车走", theme: "action" },
  { word: "提水", hint: "提着水桶", theme: "action" },
  { word: "换衣", hint: "换上衣服", theme: "action" },
  { word: "抓住", hint: "紧紧握着", theme: "action" },
  { word: "招手", hint: "举手打招呼", theme: "action" },
  { word: "拍手", hint: "鼓掌的动作", theme: "action" },
  { word: "说话", hint: "开口表达", theme: "action" },
  { word: "讲话", hint: "公开发言", theme: "action" },
  { word: "认字", hint: "认识汉字", theme: "action" },
  { word: "记性", hint: "记忆的能力", theme: "action" },
  { word: "请客", hint: "请人吃饭", theme: "action" },
  { word: "唱歌", hint: "用歌声表达", theme: "action" },
  { word: "听歌", hint: "欣赏音乐", theme: "action" },
  { word: "吹气", hint: "噘嘴呼气", theme: "action" },
  { word: "洗澡", hint: "冲掉一身汗", theme: "action" },
  { word: "洗衣", hint: "洗脏衣服", theme: "action" },
  { word: "睡觉", hint: "躺着休息", theme: "action" },
  { word: "睁开", hint: "张开眼睛", theme: "action" },
  { word: "打开", hint: "把关闭的开启", theme: "action" },
  { word: "接球", hint: "接住飞来的球", theme: "action" },
  { word: "推开", hint: "用力向前推", theme: "action" },
  { word: "跑步", hint: "快走锻炼", theme: "action" },
  { word: "跳高", hint: "向上跳跃", theme: "action" },
  { word: "踢球", hint: "用脚玩球", theme: "action" },
  // ---- emotion 心情 ----
  { word: "心情", hint: "内心的感受", theme: "emotion" },
  { word: "快乐", hint: "开心高兴", theme: "emotion" },
  { word: "快慢", hint: "速度的比较", theme: "emotion" },
  { word: "害怕", hint: "心里发慌", theme: "emotion" },
  { word: "惊讶", hint: "意想不到", theme: "emotion" },
  { word: "惊奇", hint: "又惊又奇", theme: "emotion" },
  { word: "回忆", hint: "想起往事", theme: "emotion" },
  { word: "记得", hint: "还记得住", theme: "emotion" },
  { word: "紧张", hint: "心里绷紧", theme: "emotion" },
  { word: "感动", hint: "心被触动", theme: "emotion" },
  { word: "悔过", hint: "后悔改过", theme: "emotion" },
  // ---- people 人物 ----
  { word: "他们", hint: "称呼多位男性", theme: "people" },
  { word: "你们", hint: "称呼对面的人", theme: "people" },
  { word: "好人", hint: "善良的人", theme: "people" },
  { word: "坏人", hint: "作恶的人", theme: "people" },
  { word: "工人", hint: "在工厂干活的人", theme: "people" },
  { word: "伙伴", hint: "一起玩的朋友", theme: "people" },
  { word: "作伴", hint: "互相陪伴", theme: "people" },
  { word: "身体", hint: "我们的躯体", theme: "people" },
  { word: "休息", hint: "停下歇一歇", theme: "people" },
  { word: "邻居", hint: "住隔壁的人", theme: "people" },
  { word: "邻村", hint: "附近的村子", theme: "people" },
  { word: "伙夫", hint: "做饭的人（旧称）", theme: "people" },
  // ---- city 城市 ----
  { word: "城市", hint: "热闹的大地方", theme: "city" },
  { word: "城墙", hint: "古代的城墙", theme: "city" },
  { word: "道路", hint: "行走的路", theme: "city" },
  { word: "桥头", hint: "桥的两端", theme: "city" },
  { word: "车站", hint: "车停靠的地方", theme: "city" },
  { word: "城镇", hint: "小城市", theme: "city" },
  { word: "灯光", hint: "灯发出的光", theme: "city" },
  { word: "路灯", hint: "路边的灯", theme: "city" },
  { word: "灯火", hint: "夜晚的光亮", theme: "city" },
  { word: "炉火", hint: "炉子里的火", theme: "city" },
  // ---- study 学习 ----
  { word: "课本", hint: "上课用的书", theme: "study" },
  { word: "讲课", hint: "老师上课", theme: "study" },
  { word: "笔记", hint: "记下的要点", theme: "study" },
  { word: "练字", hint: "练习写字", theme: "study" },
  { word: "铅笔", hint: "写字的文具", theme: "study" },
  { word: "钢笔", hint: "用墨水的笔", theme: "study" },
  { word: "歌曲", hint: "唱的歌", theme: "study" },
  { word: "歌词", hint: "歌里的文字", theme: "study" },
  { word: "诗歌", hint: "有韵律的文字", theme: "study" },
  { word: "读书", hint: "看书学习", theme: "study" },
  { word: "听话", hint: "听大人的话", theme: "study" },
  { word: "写字", hint: "提笔写字", theme: "study" },
  { word: "功课", hint: "每天的作业", theme: "study" },
  { word: "课程", hint: "学习的科目", theme: "study" },
  { word: "知识", hint: "学到的学问", theme: "study" },
  { word: "加油", hint: "鼓劲的话", theme: "study" },
  // ---- color 颜色 ----
  { word: "红色", hint: "喜庆的颜色", theme: "color" },
  { word: "绿色", hint: "树叶的颜色", theme: "color" },
  { word: "红绿灯", hint: "路口的信号灯", theme: "color" },
  { word: "红纸", hint: "写对联的纸", theme: "color" },
  // ---- body / health 身体 ----
  { word: "眼睛", hint: "心灵的窗户", theme: "body" },
  { word: "眨眼", hint: "快速闭眼", theme: "body" },
  { word: "睁眼", hint: "张开眼睛", theme: "body" },
  { word: "睡眠", hint: "安静的休息", theme: "body" },
  // ---- metal 金属 ----
  { word: "钢铁", hint: "坚硬的材料", theme: "metal" },
  { word: "铁锅", hint: "铁做的锅", theme: "metal" },
  { word: "铜钟", hint: "寺庙的大钟", theme: "metal" },
  { word: "银针", hint: "银制的针", theme: "metal" },
  { word: "金钱", hint: "宝贵的钱财", theme: "metal" },
  { word: "钟表", hint: "看时间的工具", theme: "metal" },
  // ---- clothing 衣物 ----
  { word: "被子", hint: "睡觉盖的", theme: "clothing" },
  { word: "补丁", hint: "缝在破洞上的布", theme: "clothing" },
  { word: "裤子", hint: "穿在腿上的", theme: "clothing" },
  { word: "裙子", hint: "女生穿的", theme: "clothing" },
  { word: "棉袄", hint: "冬天穿的厚衣", theme: "clothing" },
  // ---- tech / 其他 ----
  { word: "轮船", hint: "海上的大船", theme: "tech" },
  { word: "车轮", hint: "滚动的圆", theme: "tech" },
  { word: "转动", hint: "旋转移动", theme: "tech" },
  { word: "轻松", hint: "不费力的", theme: "tech" },
  { word: "马路", hint: "车走的路", theme: "tech" },
  { word: "码头", hint: "停船的地方", theme: "tech" },
  { word: "石头", hint: "硬邦邦的物体", theme: "tech" },
  { word: "砖头", hint: "砌墙的材料", theme: "tech" },
  { word: "回家", hint: "回到家里", theme: "tech" },
  // ---- 成语/固定搭配(2字+) ----
  { word: "江河湖海", hint: "各种大水", theme: "nature" },
];

/** 主题定义 */
export const HANZI_THEMES = [
  { id: "nature", name: "自然" },
  { id: "weather", name: "天气" },
  { id: "family", name: "家人" },
  { id: "animals", name: "动物" },
  { id: "food", name: "美食" },
  { id: "action", name: "动作" },
  { id: "emotion", name: "心情" },
  { id: "people", name: "人物" },
  { id: "city", name: "城市" },
  { id: "study", name: "学习" },
  { id: "color", name: "颜色" },
  { id: "body", name: "身体" },
  { id: "metal", name: "金属" },
  { id: "clothing", name: "衣物" },
  { id: "tech", name: "生活" },
] as const;

export type HanziThemeId = (typeof HANZI_THEMES)[number]["id"];

/** 字 → 词索引 (crossword 交叉用: 一个字出现在哪些词里) */
export const charWordIndex = (() => {
  const index = new Map<string, string[]>();
  for (const w of WORD_BANK) {
    for (const ch of w.word) {
      if (!CHAR_SPLITS[ch] && !WHOLE_CHAR_SET.has(ch)) {
        // 数据校验交给 scripts/verify-words.ts, 这里静默跳过 (避免阻断运行时)
        continue;
      }
      if (!index.has(ch)) index.set(ch, []);
      index.get(ch)!.push(w.word);
    }
  }
  return index;
})();

export const WORD_COUNT = WORD_BANK.length;