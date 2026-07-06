/** 测试数据 - 作者与推文内容 */
export interface SeedAuthor {
  name: string
  handle: string
}

export interface SeedContent {
  text: string
  lang?: string
}

export const seedAuthors: SeedAuthor[] = [
  { name: '张三', handle: 'zhangsan' },
  { name: '李四', handle: 'lisi' },
  { name: '王五', handle: 'wangwu' },
  { name: '赵六', handle: 'zhaoliu' },
  { name: '孙七', handle: 'sunqi' },
  { name: '周八', handle: 'zhouba' },
  { name: '吴九', handle: 'wujiu' },
  { name: '郑十', handle: 'zhengshi' },
]

export const seedContents: SeedContent[] = [
  { text: '今天天气真不错，适合出门散步。春天的气息越来越浓了。', lang: 'zh' },
  { text: '刚看完一部非常好的电影，推荐给大家！剧情紧凑，演员表演到位。', lang: 'zh' },
  { text: '分享一篇关于AI技术发展的文章，非常有启发性。大模型正在改变世界。', lang: 'zh' },
  { text: '周末做饭的快乐，谁能懂？今天尝试了一道新菜，味道还不错。', lang: 'zh' },
  { text: '对于这个产品设计，我有一些想法。用户体验需要更多的关注。', lang: 'zh' },
  { text: '刚刚读完这本书，值得反复阅读。每一章都有新的收获。', lang: 'zh' },
  { text: '今天去了一家新开的咖啡店，环境很好，咖啡也很香。', lang: 'zh' },
  { text: '分享一些学习笔记，希望对大家有帮助。坚持每天进步一点点。', lang: 'zh' },
  { text: '最近在研究前端框架的新特性，vue3的composition API确实好用。', lang: 'zh' },
  { text: '拍了些照片，分享一下。摄影真的是一件让人快乐的事情。', lang: 'zh' },
  { text: '对于这个社会现象，我想说几句。我们应该多一些包容和理解。', lang: 'zh' },
  { text: '刚跑完5公里，感觉整个人都精神了。运动真的能改变生活。', lang: 'zh' },
  { text: '推荐一个效率工具，用了之后生产力提升了很多。非常实用。', lang: 'zh' },
  { text: '今天参加了行业会议，收获很大。和同行交流总能碰撞出新想法。', lang: 'zh' },
  { text: '分享一下最近的代码心得，关于TypeScript类型体操的一些技巧。', lang: 'zh' },
  { text: '听到一首好听的歌，单曲循环了一整天。音乐是最好的陪伴。', lang: 'zh' },
  { text: '对于未来的规划，我有了一些新的想法。路还很长，慢慢来。', lang: 'zh' },
  { text: '推荐一个很不错的设计资源网站，里面的素材质量都很高。', lang: 'zh' },
  { text: '刚做完一个项目复盘，总结了一些经验教训。失败是成功之母。', lang: 'zh' },
  { text: '今天和朋友们聚了聚，聊了很多。好的关系需要用心经营。', lang: 'zh' },
  { text: '分享一些关于创业的思考。创业不是一条容易的路，但充满意义。', lang: 'zh' },
  { text: '看到一则新闻，觉得很有必要和大家讨论一下。你怎么看？', lang: 'zh' },
  { text: '最近在学习一门新技术，感觉打开了新世界的大门。学无止境。', lang: 'zh' },
  { text: '推荐几本我最近在读的书，涵盖了技术、哲学和管理领域。', lang: 'zh' },
  { text: '今天做了个有趣的实验，结果出乎意料。科学探索真有意思。', lang: 'zh' },
  { text: '周末去爬山了，山顶的风景真的很美。多运动对身体好。', lang: 'zh' },
  { text: '分享一款好用的Chrome插件，大幅提升工作效率。强烈推荐。', lang: 'zh' },
  { text: '读了一篇关于区块链未来的文章，有很多启发。技术改变世界。', lang: 'zh' },
  { text: '今天尝试了冥想，感觉内心平静了很多。推荐大家都试试。', lang: 'zh' },
  { text: '刚看完一个TED演讲，讲的是如何克服拖延症。干货满满。', lang: 'zh' },
  { text: '分享一些关于投资理财的心得。不要把鸡蛋放在同一个篮子里。', lang: 'zh' },
  { text: '最近在学习日语，发现语言学习真的需要每天坚持。頑張ります。', lang: 'zh' },
  { text: '今天和同事讨论了一个技术方案，碰撞出了很多新的想法。', lang: 'zh' },
  { text: '推荐一部Netflix的新剧，剧情反转再反转，看得停不下来。', lang: 'zh' },
  { text: '分享一些摄影技巧。光线是摄影的灵魂，构图是骨架。', lang: 'zh' },
  { text: '参加了朋友的婚礼，感动得热泪盈眶。祝福他们幸福美满。', lang: 'zh' },
  { text: '刚完成了一个开源项目的第一版，虽然简单但很有成就感。', lang: 'zh' },
  { text: '今天去了一家很有特色的面馆，排队半小时但值得。', lang: 'zh' },
  { text: '读了一篇关于量子计算的科普文章，虽然很多没看懂但很有趣。', lang: 'zh' },
  { text: '分享一个CSS技巧，几行代码就能实现很炫的动画效果。', lang: 'zh' },
  { text: '最近在培养早起的习惯，坚持了21天感觉整个人都不一样了。', lang: 'zh' },
  { text: '看到一个很棒的UI设计案例，配色和排版都值得学习。', lang: 'zh' },
  { text: '今天跑步突破了个人记录，5公里用时22分钟。继续加油。', lang: 'zh' },
  { text: '分享一些关于远程工作的经验，自律和沟通是最重要的。', lang: 'zh' },
  { text: '推荐几首适合工作时听的纯音乐，无歌词更有助于专注。', lang: 'zh' },
  { text: '最近在研究微服务架构，有很多坑但也有很大的价值。', lang: 'zh' },
  { text: '今天自己做了一顿大餐，虽然卖相一般但味道还不错。', lang: 'zh' },
  { text: '分享一些简历优化的经验，希望能帮助正在找工作的朋友。', lang: 'zh' },
  { text: '周末去逛了博物馆，看到了很多珍贵的历史文物。受益匪浅。', lang: 'zh' },
]
