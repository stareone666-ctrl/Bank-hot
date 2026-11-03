# Bank HoT 信源核对清单

这份清单列出 Bank HoT 要盯的信源。各家官网和招投标平台**都还没核对过**：开发时用的机器在海外，连不上这些站。部署到国内服务器后，按下面的步骤逐个核对，再在后台启用。

## 核对步骤（每个信源 5 分钟左右）

1. 在浏览器里打开机构官网，找到下表要找的栏目，复制**列表页**地址（能看到一条条公告的那一页，不是某一条公告）。
2. 在列表页上按 F12，找出“每一条公告”对应的元素，记下它的 CSS 选择器（比如 `.list li`、`ul.news-list > li`），以及标题链接和日期在条目里的选择器。
3. 进入后台 `/admin/sources/new`：类型选 `web_list`，把下面的模板改好后粘贴进“采集配置（JSON）”。
4. 点“预览抓取”，检查抓到的是公告而不是导航菜单，标题和日期与网页上一致。
5. 按表里的建议设好分级（tier）、所属机构和类别，点“创建”。
6. 列表页是靠 JavaScript 加载的（预览抓不到条目）时：先在浏览器 F12 的“网络”面板里找它调用的 JSON 接口，改用 `json_list`；找不到接口时，再考虑 Jina Reader（按次计费，见 [信源](sources.md)）。

## 要找的栏目

| 机构 | 要找的栏目 | 类型建议 | 分级 | 所属机构（owner_entity_id） | 类别 |
|---|---|---|---|---|---|
| 中原银行 | 官网（zybank.com.cn）的“采购公告 / 招标采购”栏目 | web_list + 培训关键词过滤 | T1 | `zybank` | 不设 |
| 中原银行 | 官网的“新闻动态 / 中原银行要闻”栏目 | web_list | T1 | `zybank` | `press` |
| 河南农商银行 | 河南农商银行（原河南农信、河南农商联合银行）官网的“采购公告”栏目 | web_list + 培训关键词过滤 | T1 | `henan-rcb` | 不设 |
| 河南农商银行 | 同上官网的“新闻中心 / 农信要闻”栏目 | web_list | T1 | `henan-rcb` | `press` |
| 邮储银行 | 官网（psbc.com）的“采购公告 / 采购信息”栏目，能按分行筛的，只取河南省分行 | web_list + 培训关键词过滤 | T1 | `psbc` | 不设 |
| 中国邮政 | 中国邮政集团的采购与招标平台（找河南省分公司的公告） | web_list 或 json_list + 培训关键词过滤 | T1 | `chinapost` | 不设 |
| 中邮保险 | 中邮人寿官网（chinapost-life.com）的“采购公告 / 信息披露 → 采购”栏目 | web_list + 培训关键词过滤 | T1 | `chinapost-life` | 不设 |
| 招投标平台 | 中国招标投标公共服务平台、河南省公共资源交易中心、河南省政府采购网：用站内搜索“培训”加机构名，取搜索结果页 | web_list 或 json_list + 培训关键词过滤 | T1_5 | 不填 | 不设 |
| 监管 | 国家金融监督管理总局河南监管局（nfra.gov.cn）的“通知公告 / 行政许可”栏目 | web_list | T1 | `nfra` | `press` |

河南省内各地农商银行如果有自己的官网和采购栏目（郑州农商银行等），按同样方式加，所属机构都填 `henan-rcb`。微信公众号先不接；以后要接，需要“极致了”的 API Key（按请求收费），信源类型选 `mp_account`。

## 配置模板

### 采购公告页（带培训关键词过滤）

```json
{
  "url": "https://（采购公告列表页的地址）",
  "parseMode": "html",
  "itemSelector": "（每一条公告的选择器，例如 .list li）",
  "linkSelector": "a",
  "titleSelector": "a",
  "publishedAtSelector": "（日期的选择器，例如 span.date）",
  "allowUrlPrefixes": ["https://（公告详情页共同的地址前缀）"],
  "ingestNoiseFilter": {
    "keepIfMatches": ["培训", "培养", "研修", "轮训", "训练营", "课程", "讲师", "师资", "内训", "学院", "学习平台", "网络学院", "e学", "拓展", "测评", "人才发展", "领导力", "辅导", "考试", "认证"],
    "dropMarkersTitleOnly": ["采购", "招标", "比选", "询价", "谈判", "磋商", "单一来源", "意向", "中标", "成交", "结果", "更正", "澄清", "延期", "终止", "废标", "流标", "公告", "公示"]
  },
  "_aihot": { "initialBackfillLimit": 20 }
}
```

`ingestNoiseFilter` 的意思：标题里出现 `dropMarkersTitleOnly` 的词（也就是各类采购公告）就丢掉，**除非**标题或摘要里有 `keepIfMatches` 的培训类关键词。这样设备、装修、物业之类的采购在抓取时就被挡掉，不消耗模型调用；剩下的再由预筛提示词（`industry/prompts/prefilter.md`）细判。

关键词不全会漏掉标讯：上线头两周，在后台看一下这些信源“被过滤”的条目，发现漏了就把词加进 `keepIfMatches`。只看标题的话，“2026 年度综合服务采购”这类标题里没写培训的公告会被丢掉；如果这类公告多，删掉 `ingestNoiseFilter`，全部交给预筛判断（会多花一些模型调用）。

### 新闻页（不过滤）

```json
{
  "url": "https://（新闻列表页的地址）",
  "parseMode": "html",
  "itemSelector": "（每一条新闻的选择器）",
  "linkSelector": "a",
  "titleSelector": "a",
  "publishedAtSelector": "（日期的选择器）",
  "_aihot": { "initialBackfillLimit": 20 }
}
```

新闻页里大量是业务宣传，预筛会挡掉和培训、机构变化无关的稿件；入选门槛由类别 `press` 抬到 70（`industry/selection.ts`）。

## 核对完之后

把通过核对的信源配置写回 `industry/sources.json` 的 `sources` 数组（字段见 [customize.md](customize.md) 第 3 节），以后重新部署时会自动导入。

记得把河南农商银行官网的域名补进 `industry/taxonomy.ts` 的 `PUBLISHER_DOMAINS`。
