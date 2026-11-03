// 这个行业的分类体系：类别、标签词表、公司（主体）名录，以及防止张冠李戴的身份词典。
// 模型按这里的词表打标签，主题页（topics.json）按标签归类，筛选栏按类别分组。
// 换行业时：类别的 key 会出现在网址里（/all?category=…），上线后就不要再改；标签和名录可以随时增减。

/**
 * 网页上的类别（筛选栏、卡片角标、RSS 分类订阅）。key 是网址和接口里的身份，上线后不要改。
 * section 是日报里的分节标题（几个类别可以共用一节，按这里的顺序排）；guide 告诉结构抽取模型这一类收什么、
 * 和相邻类别的边界在哪（总的归类原则写在 prompts/structure.md 里）。
 * commentary 标出评论类（教程、观点）：日报写过的事又有评论类的后续报道，只占一行快讯（报道它的信源够多时除外）。
 * 没归上类的资料在日报里放进第一个 key 为 industry 的类别所在的节（没有就放最后一节）。
 * tagColor 是飞书推送卡片里跟在标题后面的这一类小标签的颜色（飞书 text_tag 的颜色名）。
 * feedLabel 是分类 RSS 标题里的名字（不写就用 label）。公开接口、RSS 和 MCP 里要把一类并进另一类发布，写在站点设置里（site/site.ts 的 PUBLIC_CATEGORIES）。
 */
export const CATEGORIES = [
  { key: "tender", tagColor: "orange", label: "标讯", feedLabel: "培训类标讯", section: "招标与采购", guide: "金融机构发出的、与培训相关的招标、采购、比选、询价、竞争性谈判或磋商、采购意向、资格预审公告，以及这些项目的更正、延期、澄清和终止公告。采购对象是培训服务、课程开发、讲师、学习平台、培训场地、拓展、人才测评或咨询辅导。已经公布结果的归中标。" },
  { key: "award", tagColor: "red", label: "中标", feedLabel: "中标与成交", section: "中标与成交", guide: "培训相关项目的中标候选人公示、中标或成交结果、合同公示、废标与流标公告。重点是谁中了、多少钱、哪个项目。还在征集供应商的归标讯。" },
  { key: "training", tagColor: "turquoise", label: "培训", feedLabel: "培训动态", section: "培训动态", guide: "金融机构已开展、正在开展或正式启动的培训班、人才培养项目、技能竞赛、内训师队伍建设、学院或培训中心建设，以及培训成果报道。发出采购公告的归标讯；只是表态重视人才、没有具体项目的归机构。" },
  { key: "policy", tagColor: "indigo", label: "政策", feedLabel: "监管与政策", section: "监管与政策", guide: "监管机构、行业协会或总行（总公司）发布的、对从业人员培训、资格考试、继续教育、合规教育、消费者权益保护教育等提出要求的文件和通知，以及对培训需求有直接影响的监管新规。" },
  { key: "industry", tagColor: "green", label: "机构", feedLabel: "机构动态", section: "机构动态", guide: "机构本身的人事任免、改革重组、合并、战略规划、组织架构调整和经营业绩。它们决定接下来谁有培训需求、需求是什么，但本身不是培训项目或采购。", commentary: true },
] as const satisfies ReadonlyArray<{ key: string; tagColor: string; label: string; feedLabel?: string; section: string; guide: string; commentary?: true }>;

/**
 * 这个行业最受关注的一类发布：日报报头的“N 条新标讯”、改分类后修订已出的报告都按它数。
 * category 是类别，tag 是标签，两者都对上才算；unit 接在数字后面。
 */
export const RELEASE: { category: string; tag: string; unit: string } | null = { category: "tender", tag: "招标采购", unit: "条新标讯" };

/** 周报月报的总述可以直接写、不必在报道里找到出处的行业通用词（小写）。站名会自动算进去。 */
export const PLAIN_TERMS: readonly string[] = ["银行", "农商行", "培训", "标讯", "采购", "招标", "中标", "供应商"];

/**
 * 内容理解一步给每篇资料判的“内容类型”（写在 prompts/content-understanding.md 里，改了类型要同步改那份提示词）。
 * 评分提示词（prompts/selection-score.md）按类型给五个维度不同的权重。
 */
export const ITEM_TYPES = ["tender_notice", "award_result", "training_activity", "policy_regulation", "institution_news", "analysis_insight"] as const;

// ── 标签词表 ────────────────────────────────────────────────────────────────────────────

/** 每篇资料的第一个标签必须是这些“分类标签”之一。 */
export const CATEGORY_TAGS = [
  "招标采购", "采购意向", "更正/终止", "中标结果", "培训动态", "人才培养", "监管政策", "机构动态", "行业观察", "其他",
] as const;

/** 可选的主题标签：培训方向。 */
export const TOPIC_TAGS = [
  "领导力/干部培训", "新员工培训", "客户经理/营销", "网点/柜面服务", "风险合规", "数字化转型", "金融科技", "普惠/乡村振兴",
  "财富管理", "保险销售", "内训师", "线上学习平台", "党建培训", "资格考试/认证", "拓展/团建", "人才测评",
] as const;

/** 可选的实体标签（机构）。 */
export const ENTITY_TAGS = ["中原银行", "河南农商银行", "邮储银行", "中国邮政", "中邮保险", "金融监管总局", "人民银行"] as const;

/** 模型常写的近义词，统一成词表里的写法。 */
export const TAG_SYNONYMS: Readonly<Record<string, string>> = {
  招标: "招标采购", 采购: "招标采购", 比选: "招标采购", 询价: "招标采购", 竞争性谈判: "招标采购", 竞争性磋商: "招标采购", 招标公告: "招标采购", 采购公告: "招标采购", 标讯: "招标采购",
  意向: "采购意向", 采购计划: "采购意向",
  更正: "更正/终止", 延期: "更正/终止", 澄清: "更正/终止", 终止: "更正/终止", 废标: "中标结果", 流标: "中标结果",
  中标: "中标结果", 成交: "中标结果", 结果公示: "中标结果", 中标候选人: "中标结果", 中标公告: "中标结果", 成交公告: "中标结果",
  培训: "培训动态", 培训班: "培训动态", 开班: "培训动态", 竞赛: "培训动态", 技能竞赛: "培训动态",
  人才: "人才培养", 人才队伍: "人才培养", 人才工程: "人才培养",
  监管: "监管政策", 政策: "监管政策", 通知: "监管政策", 法规: "监管政策",
  人事: "机构动态", 任免: "机构动态", 改革: "机构动态", 重组: "机构动态", 合并: "机构动态", 战略: "机构动态", 业绩: "机构动态",
  观点: "行业观察", 分析: "行业观察", 趋势: "行业观察",
  领导力: "领导力/干部培训", 干部培训: "领导力/干部培训", 中层: "领导力/干部培训", 管理培训: "领导力/干部培训",
  新员工: "新员工培训", 新入行员工: "新员工培训", 校招: "新员工培训",
  营销: "客户经理/营销", 客户经理: "客户经理/营销", 柜面: "网点/柜面服务", 网点: "网点/柜面服务", 服务礼仪: "网点/柜面服务",
  合规: "风险合规", 风控: "风险合规", 反洗钱: "风险合规", 案防: "风险合规",
  数字化: "数字化转型", 金融科技: "金融科技", 科技: "金融科技", 普惠: "普惠/乡村振兴", 乡村振兴: "普惠/乡村振兴",
  理财: "财富管理", 财富: "财富管理", 保险: "保险销售", 代理人: "保险销售",
  内训: "内训师", 讲师: "内训师", 学习平台: "线上学习平台", 线上学习: "线上学习平台", 网络学院: "线上学习平台",
  党建: "党建培训", 考试: "资格考试/认证", 认证: "资格考试/认证", 拓展: "拓展/团建", 团建: "拓展/团建", 测评: "人才测评",
  邮储: "邮储银行", 中国邮政储蓄银行: "邮储银行", 邮政: "中国邮政", 中邮人寿: "中邮保险", 河南农商联合银行: "河南农商银行", 农商银行: "河南农商银行",
  国家金融监督管理总局: "金融监管总局", 金融监管局: "金融监管总局", 中国人民银行: "人民银行",
};

// ── 机构与主体 ──────────────────────────────────────────────────────────────────────────

/**
 * 机构主题：id → 显示名、卡片上显示的标签（null 表示只用 entity:<id> 归类）、别名。
 * aliases 给结构抽取模型看；orgNames 是这家机构发消息时开头用的组织名，在它自己的主题页上可以省去；
 * otherNames 是其他称呼（分支机构名、品牌）。所有这些名字都用来认出说的是哪家机构。
 */
export const ENTITIES: Record<string, { name: string; displayTag: string | null; aliases: string[]; orgNames?: string[]; otherNames?: string[] }> = {
  zybank: { name: "中原银行", displayTag: "中原银行", aliases: ["中原银行", "Zhongyuan Bank"], orgNames: ["中原银行股份有限公司", "中原银行"], otherNames: ["中原银行郑州分行", "中原银行洛阳分行"] },
  "henan-rcb": {
    name: "河南农商银行", displayTag: "河南农商银行",
    aliases: ["河南农商银行", "河南农商联合银行", "河南农信", "河南省农村信用社联合社", "农商银行", "农商行"],
    orgNames: ["河南农村商业银行股份有限公司", "河南农商联合银行股份有限公司", "河南农商银行", "河南农商联合银行", "河南省农村信用社联合社"],
    otherNames: ["郑州农商银行", "洛阳农商银行", "新乡农商银行", "南阳农商银行", "商丘农商银行", "信阳农商银行", "周口农商银行", "驻马店农商银行"],
  },
  psbc: { name: "邮储银行", displayTag: "邮储银行", aliases: ["邮储银行", "中国邮政储蓄银行", "邮储", "PSBC"], orgNames: ["中国邮政储蓄银行股份有限公司", "中国邮政储蓄银行", "邮储银行"], otherNames: ["邮储银行河南省分行", "中国邮政储蓄银行河南省分行"] },
  chinapost: { name: "中国邮政", displayTag: "中国邮政", aliases: ["中国邮政", "中国邮政集团", "河南邮政"], orgNames: ["中国邮政集团有限公司", "中国邮政集团有限公司河南省分公司", "中国邮政"], otherNames: ["河南邮政", "河南省邮政分公司"] },
  "chinapost-life": { name: "中邮保险", displayTag: "中邮保险", aliases: ["中邮保险", "中邮人寿", "中邮人寿保险"], orgNames: ["中邮人寿保险股份有限公司", "中邮人寿保险股份有限公司河南分公司", "中邮保险"], otherNames: ["中邮人寿河南分公司"] },
  nfra: { name: "金融监管总局", displayTag: "金融监管总局", aliases: ["国家金融监督管理总局", "金融监管总局", "河南金融监管局"], orgNames: ["国家金融监督管理总局", "国家金融监督管理总局河南监管局"] },
};

/**
 * 身份词典：摘要和标题里出现的机构，必须在原文里也出现过，否则退回原标题、丢掉摘要（防止模型把一家的标讯写成另一家的）。
 */
export const IDENTITY_LEXICON: ReadonlyArray<{ id: string; name: string; patterns: RegExp[] }> = [
  { id: "zybank", name: "中原银行", patterns: [/中原银行|zhongyuan\s?bank/i] },
  { id: "henan-rcb", name: "河南农商银行", patterns: [/农商(?:联合)?银行|农商行|农信|农村信用|农村商业银行/] },
  { id: "psbc", name: "邮储银行", patterns: [/邮储|邮政储蓄|\bPSBC\b/i] },
  { id: "chinapost", name: "中国邮政", patterns: [/中国邮政(?!储蓄)|邮政(?:集团|分公司|公司)/] },
  { id: "chinapost-life", name: "中邮保险", patterns: [/中邮(?:人寿|保险)/] },
  { id: "nfra", name: "金融监管总局", patterns: [/金融监(?:督)?管(?:理)?总局|金融监管局/] },
];

/**
 * 这些域名上的文章，发布方就是对应的机构。
 * 河南农商银行的官网域名在部署后核对（见 docs/bankhot-sources.md），确认后再加进来。
 */
export const PUBLISHER_DOMAINS: ReadonlyArray<{ entityId: string; domains: readonly string[] }> = [
  { entityId: "zybank", domains: ["zybank.com.cn"] },
  { entityId: "psbc", domains: ["psbc.com"] },
  { entityId: "chinapost", domains: ["chinapost.com.cn"] },
  { entityId: "chinapost-life", domains: ["chinapost-life.com"] },
  { entityId: "nfra", domains: ["nfra.gov.cn"] },
];

/** 原文里的这些写法也算提到了对应机构。 */
export const IDENTITY_CONTEXT_ALIASES: ReadonlyArray<{ entityId: string; pattern: RegExp }> = [];
