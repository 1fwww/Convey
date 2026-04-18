# Convey — Product Discovery Notes

**Started**: 2026-04-16
**Status**: Pre-validation
**Purpose**: Thinking infrastructure for an unnamed product direction
(working name: Convey / 达意)

---

## 0. 先承认这是什么

这个文档是一次长对话的产物。它不是 validated truth，也不是 PRD。
它是**当时想到的东西的 snapshot**，外加**对这些想法的真实 confidence level 标注**。

未来的我读这个文档时，要记得：
- 今天 feel 很 compelling 的 framing，可能 6 个月后看是 noise
- 今天 flagged 的 doubt，往往比 framework 更 valuable
- 所有 high-confidence 声明都需要 user 数据验证
- 如果一个 insight 没 survive 真实 user research，扔掉它

---

## 1. 核心 Thesis（Hypothesis Level）

### 1.1 产品定义

Convey 是一个 macOS native 工具，帮助在英语环境工作的 non-native
professional —— 尤其中文母语者 —— 在工作中**更好地用英语表达自己**。

核心差异化：不替你写，而是帮你理解和成长。
（"Don't replace, explain."）

### 1.2 Target User

**Persona: Non-native professional on plateau**

- 在英语环境工作 2+ 年
- 中文母语（primary target）
- 英语水平 B2-C1（functional but not native）
- 28-40 岁
- Knowledge worker（PM / Designer / Marketer / Eng heavy in writing）
- 年薪 $150K+
- 有 growth mindset（愿意投资自己，不只想 shortcut）

**用户自我描述（来自真实原话）**:
> "工作以后没有人会教我英语了，但是其实我是需要学一学的。"

### 1.3 Working Name

**Convey**（英文）/ **达意**（中文）

Rationale:
- "Convey" 在英文里对应 "accurately transfer essence"，跟产品功能贴合
- "达意" 是 "词不达意"的反面，击中 non-native 核心痛点
- 但不 lock-in —— 名字是 nice-to-have，不是产品的 defining 决策

---

## 2. 核心产品哲学

### 2.1 Mirror, not coach

AI 不 try 到 understand 用户，AI 帮用户 understand 自己。

- AI 做 observation（machine 擅长）
- 用户做 interpretation（human 不可替代）
- 产品做 framing（design 工作）

**关键 principle**:
> Every feature tested against: are we crossing the gap (AI pretending
> to know user's inner world), or helping user cross it themselves?

### 2.2 Scaffolding, not co-creation

这是整个对话里**最重要的单一 insight**。

**Co-creation 的鸿沟不可逾越**：AI 需要用户的 tacit knowledge 才能真正
co-create，但 tacit knowledge 本质上不可传输（Polanyi）。

**Scaffolding 不需要跨 gap**：AI 只需要问对问题，让用户自己 surface
自己的内在世界。

| Co-creation | Scaffolding |
|---|---|
| AI 试图 understand 用户 | AI 帮用户 articulate 自己 |
| AI 生成，用户 edit | 用户生成，AI 提问 |
| AI 失败 = wrong output | AI 失败 = wrong question |
| 鸿沟是 blocker | 鸿沟被 side-stepped |

**鸿沟是 feature，不是 bug**：
- 如果没有鸿沟，ChatGPT 就够了，Convey 不必存在
- 鸿沟 forces 用户 engage
- 鸿沟 guarantees output authentic
- 鸿沟是 Convey 的 moat

### 2.3 Forgetful, not surveilling

**Design principle**:
> Convey forgets between sessions, unless you explicitly ask it to remember.

- Session-bound，不主动积累 cross-session profile
- User-initiated only
- 反 "always-on ambient analysis"

**为什么**: "好深啊" 反应（cross-conversation tone analysis demo）
揭示了 depth-of-analysis 跟 invasiveness 是挂钩的。Mirror framing +
forgetful design = trust sustainable。

---

## 3. 产品 Form Factor

### 3.1 核心交互

Glimpse 的 macOS native + hotkey 形态是 strategic asset，不是 legacy。

**Two flows:**

**Flow A: Copy-paste ask**
```
用户 copy 文字 → hotkey → 弹出 → AI 分析 → 用户 decide
```

**Flow B: Screenshot ask**
```
用户截图任意 app → hotkey → 弹出 → AI 识别 app context →
自动推断"你的"vs"别人的" → context-aware 分析
```

### 3.2 为什么这个 form 是对的

- **Universal capture 在 AI vision 时代是 strategic advantage**
  —— 不需要集成任何平台
- **User-initiated = privacy-friendly**（vs always-on）
- **Screenshot 让 AI 看到对方 context**（Grammarly 做不到）
- **macOS native 覆盖所有 desktop app**（含 Slack/Linear/Notion desktop）

### 3.3 不要做

- Slack/Linear/Gmail 的 OAuth 深度集成（universal capture 已够）
- Streak / XP / gamification（违反 work tool identity）
- Always-on background analysis（surveillance）
- Auto-replace without explanation（变成 Grammarly）
- Cross-conversation voice profiling（too invasive）

---

## 4. 产品 Features（按 confidence 排序）

### 4.1 V1 Core (higher confidence)

| Feature | Confidence | Note |
|---|---|---|
| Copy/paste ask with explanation | High | Core loop |
| Screenshot ask with context inference | Medium-High | Differentiator but harder to execute |
| Sensitive info masking (user-confirmed) | High | Trust story |
| Onboarding: native language + role | Medium | Essential but UX risky |

### 4.2 V1 Exploratory (medium confidence)

| Feature | Confidence | Note |
|---|---|---|
| Per-message tone check | Medium | 单句好做，cross-message 别做 |
| "Un-authenticity detector" | Medium | 抓 AI-sounding phrases that aren't "you" |
| Mode B: scaffolding for high-stake messages | Low-Medium | 难 design，但可能是产品灵魂 |

### 4.3 Later (V2+)

| Feature | Note |
|---|---|
| Weekly reflection ("你这周学到的 3 件事") | Retention loop |
| User-set target tone + consistency check | 需要 onboarding 投资 |
| Meeting prep feature | Sunday-night anxiety use case |
| "Speak Test" feature | Writing-to-speaking bridge |
| Long-term voice evolution tracking | Needs months of data |

---

## 5. AI 输出的 5-layer Taxonomy

这是 AI 可能反馈给用户的 dimensions。不是语言学完整框架
（完整框架不存在），是**产品 design 够用的分类**。

1. **Correctness** — grammar、collocation、typo（Grammarly level）
2. **Naturalness** — native speaker wouldn't phrase it this way
3. **Tone** — directness, warmth, confidence, formality
4. **Impact / Implication** — how reader might read it
5. **Authenticity** — does this sound like you

**V1 focus**: Layer 2 + Layer 4（对 Grammarly 的差异化 + 对 ChatGPT
的差异化）

**不做 Layer 1**: Commoditized
**V1 不做 Layer 3**: 需要 onboarding target tone，增加摩擦
**V1 只做 Layer 5 的负向版本**: Un-authenticity detector（抓异常比定义
voice 容易 10 倍）

---

## 6. Authenticity 的特殊思考

这是 Convey 最难也最 distinctive 的一层。

### 6.1 ChatGPT 模仿 voice 只抓 surface pattern

- Vocabulary level
- Sentence structure
- Punctuation habits
- Opening/closing patterns
- Hedging level
- Register

**这些不够**，因为真实 voice 还包含：
- Omission（你选择不说的）
- Thought flow（你的 ideas 怎么 connect）
- Priorities（你 care 什么）
- Relational memory（你和对方的 shared history）
- Inconsistencies（跟不同人说话方式不同）

### 6.2 Convey 的 authenticity 策略

**不 compete 在 "AI 模仿 voice" 赛道**。
**Redefine 成 "AI 保护 voice 不被 AI 侵蚀"**。

- ChatGPT: "I come from 用户"
- Convey: "I keep 用户 being 用户"

具体形态 —— **Un-authenticity detector**:
- 用户 paste 历史消息 baseline
- AI 抓 vocabulary / phrasing pattern
- 当用户 paste 一段 draft，AI flag "这些词你从来没用过"

优点：
- 抓异常比定义 voice 容易
- Utility 接近 full imitation
- 没有 over-promise
- 完全不需要"跨 gap"

---

## 7. 商业模式 Hypothesis

### 7.1 Pricing

- **起步 $29/月 或 $290/年**
- Anchor 在 self-investment 心理账户（Headspace / Masterclass）
- 高于 Grammarly（$12）signal 不是同类
- Non-native 东亚用户对 $19-29 比 $9-15 接受度更高

### 7.2 不做 free tier

- 14 天 free trial
- Early 可限量 ("50/week")
- 筛选 serious user

### 7.3 长期演化

- V1: $29/月 基础
- V2: + $99/月 human coaching add-on
- V3: $50-60/月 identity product tier

---

## 8. Go-To-Market Hypothesis

### 8.1 First 100 users

**Target: ELSA / Speak / Loora 的 working professional 用户**

Rationale:
- Self-selected motivated learners
- 已有付费习惯
- 已接受 AI coaching 价值
- Demographic 高度 overlap

### 8.2 Channels

- r/EnglishLearning、r/languagelearning
- ELSA/Loora social community
- 小红书英语相关博主生态
- 华人 tech influencer 合作

### 8.3 Distribution 特点

Language tool 的 viral 传播是 **dark social**（DM / 私聊），不是公开。
所以要 design for private recommendation：
- DM-ready share templates
- 推荐奖励
- 私域社群（Discord / 小红书）
- 不 rely on "tweet going viral"

### 8.4 Marketing Angle 候选

**Angle 1: Counter-AI-atrophy**
> "AI makes the world write faster. And worse. Studies show 83% of
> AI-assisted writers can't remember what they 'wrote.'"

**Angle 2: Asymmetric fluency（未 validate）**
> "AI can write for you. It can't speak for you. The more you outsource
> writing, the worse your speaking gets."

**Angle 3: Don't humanize, be yourself**
> "Humanizers hide your AI use. Convey helps you use AI without losing
> yourself."

---

## 9. 竞争定位

### 9.1 Matrix

```
              Short-term pain       Long-term identity
              (发错邮件)            (职业天花板)
           ┌─────────────────────┬─────────────────────┐
 Tactical  │  Grammarly, GPT,    │    空白              │
 (单句)    │  Natively, Engram   │                     │
           ├─────────────────────┼─────────────────────┤
 Strategic │   空白               │     CONVEY          │
 (长期)    │                     │                     │
           └─────────────────────┴─────────────────────┘
```

Convey 的 position = 右下角，几乎没人在。

### 9.2 关键竞争 insights

- **Grammarly 结构性做不了深教育** —— 3000 万日活要求 generic；
  商业模式 ("indispensable tool") 跟 "教会用户就走" 冲突
- **Speaking apps（ELSA/Speak/Loora）不是竞品** —— learning budget
  vs work budget，不同象限
- **Humanizer 市场（8000 万+ traffic）不是 Convey 对手** —— shame
  market vs growth market，不同 JTBD
- **ChatGPT 是最大威胁** —— 但它的 "do it for you" 永远是 counter
  to Convey 的"help you grow"

---

## 10. Research-Backed Market Insights

### 10.1 High confidence（有研究支持）

- **AI 使用正在 cause cognitive atrophy**
  - MIT Media Lab 2025: LLM 用户最弱脑区连接性，83% 记不住自己
    "写"过什么
  - 即使停用 AI 后脑活动保持低迷（persistent effect）
  - "AICICA" (AI Chatbot-Induced Cognitive Atrophy) 成为学术术语

- **ChatGPT 使用结构**
  - 40% 工作使用跟 writing 相关
  - 其中 2/3 是 edit/critique 而非从零生成
  - 49% 是 "Asking"，40% "Doing"

- **市场规模**
  - 60% desk worker 用 AI（2025）
  - 每天 AI 使用翻倍速度
  - 73% weekly AI 用户感到"依赖"

### 10.2 Medium confidence（逻辑强但未 specifically 验证）

- Non-native professional 愿意付 premium for self-investment tools
- 东亚用户对 "language shame" 更敏感
- $19-29/月 定价 sweet spot（work + self-investment 交叉账户）

### 10.3 Lower confidence（我的 extrapolation，要 skeptical）

- "Asymmetric fluency" concept（writing 虚高 speaking 暴露）
- "Silent switching"（non-native 下意识 avoid 复杂表达）
- "Invisible labor 2-3x" （具体数字不严谨）
- TAM 1300-1600 万数字（assumption chain 乘出来）
- Meeting prep 是 killer use case

---

## 11. 困惑点 / Open Questions

**这一节跟 framework 一样重要 —— 记录我不知道什么。**

### 11.1 根本性不确定性

- **Target 用户 pain 是否真的 salient** —— 还是温水状态
- **"Explain why" 的 WTP premium** —— 会不会 user 嘴上说 care growth
  实际买最快的
- **Cold start distribution** —— non-native professional 沉默群体，
  怎么找到他们
- **Convey 自己能不能长期 maintain** —— 6 个月后我还 care 吗

### 11.2 产品层面未解决

- Onboarding 的 "first 30 seconds" 怎么设计到既不 friction 又能
  capture personalization
- Mode B (scaffolding) 怎么 balance "问足够"和"不 annoying"
- Sensitive info masking 的 false positive rate 可接受吗
- Privacy story 如何 communicate 不显得 paranoid
- 定价是否会成为 early traction 障碍

### 11.3 Authenticity 的具体问题

- 用户 paste 多少 sample 能抓到 meaningful voice？
- Un-authenticity detection 在多少个 word-level 差异触发？
- 怎么让这个 feature 不 feel intrusive / judgmental
- Voice baseline 随时间怎么 evolve

### 11.4 竞争的不确定性

- ChatGPT / Claude 如果加 "personalized style matching"，Convey
  的 un-authenticity 价值 eroded？
- Grammarly 如果开始做"non-native 专属解释"，怎么办？
- Apple Intelligence 如果 OS-level 整合类似功能，怎么办？

---

## 12. Reality Checks

### 12.1 关于今天的对话

这个文档来自一次长对话。我（Claude）在对话里系统性地**倾向 pro-Convey 的
reframe**，因为：
- 我的 context 全是 Convey 的 detail
- 我被训练去 helpful
- 每次 doubt 被 reframe，narrative 就更 coherent
- 没有一次认真 argue Convey 会失败

**所以这个文档里所有 insight 都应该打折扣**，signal value 大约等于
"一个懂产品的朋友跟你聊了 5 小时"。Valuable 但不是 gospel。

### 12.2 关于 Convey 这个方向本身

- **Base rate for ambitious indie product is failure**
- **Convey 尝试做很多 simultaneously 难的事**（emotional AI、深度
  差异化、沉默用户、novel UX）
- **Grammarly 花 14 年 + $400M 做了一个比 Convey 简单的产品**

Convey 可能就是做不好。这不是 "你不够聪明"，是 "这事本身结构性难"。

### 12.3 我今天 over-sold 的 claim（要 skeptical）

- "Asymmetric fluency" —— 我综合出来的 framing，无 established research
- "Un-authenticity detector will work" —— 未 validate，可能 false positive 多
- "Meeting prep is killer feature" —— 完全 hypothesis
- "ELSA 用户 = ideal early adopter" —— 逻辑强但无 data
- 各种 TAM 数字 —— assumption chain 乘出来，可能差 10 倍

---

## 13. 方法论原则

### 13.1 User research

- **问行为，不问观点**
- **问具体 incident，不问 general**
- **问 trade-off，不问 preference**
- **抓 4 种情绪反应**: light up / uncomfortable / satisfied / deeper reveal
- **追问 contradiction，沉默 be your friend**

### 13.2 5 层 validation

1. Pain 是否真实 salient
2. Current behavior 是否 broken
3. Growth mindset 是否存在
4. Form factor (embedded) 是否对
5. Willingness to pay

**每层如果不成立，后面不用聊**。

### 13.3 小成本验证优于大成本思考

- **45 分钟 × 3 朋友对话 > 5 小时产品 brainstorm**
- **2 周人肉 prompt validation > 2 个月代码**
- **真实用户 1 句话 > 任何理论 framework**

---

## 14. 立即可做的 Next Action

### 最小 test（45 分钟）

找 3 个 non-native PM 朋友，每人 15 分钟，问一个问题：

> "上次你因为英语写作 frustrated 是什么时候？具体发生了什么？"

不要 pitch Convey，不要 demo，不要解释你在做什么。就听。

**Signal:**
- 3 人里 2+ 个讲出 vivid story 带情绪 → pain is real
- 全部语焉不详 → pain 是你个人的

这 45 分钟会 give 你 6 个月对话给不了的 signal。

### 如果 signal 好 → Phase 1（2 weeks）

**Week 1**: 写 Claude custom prompt 自己 dogfood
- 每天工作中真实使用
- 迭代 5-10 次
- 记录哪些 output 让自己 "学到了"

**Week 2**: 5 个朋友试用 prompt
- 30 分钟 1:1 interview
- 按 5 layer validation
- 每次 interview 后 writedown:
  - 1 surprise
  - 1 confirmation
  - 1 contradiction

### Go/No-Go（≥2 满足为 Go）

- 5 人里 3+ 说 "我每天都在用"
- 至少 1 人说 "愿意付 $15+/月"
- 至少 1 人讲了没预想到的 use case
- 自己 50+ 次使用不厌倦

### No-Go signal（任一）

- 3+ 人用 <5 次
- 所有人说 "跟 ChatGPT 差不多"
- 自己觉得 prompt 不够深

---

## 15. 关于 Glimpse 的处理

Glimpse = 工程资产 + 已打磨的 design system + 6 个月的 sunk learning。

**不当 pivot，当 refocus**：
- Form 不变（screenshot + AI hotkey）
- Audience 收窄(PM → non-native PM)
- Mission 升级（productivity → communication identity）
- Name 可能改（Glimpse → Convey）

**工程资产约 90% 可复用**：
- Swift shell / WKWebView / hotkey / capture / API 全部复用
- 要重写: prompt / UI content / onboarding / landing

**ship 预期**：
- v0.1 可用版: 4-6 weeks (不是 4-6 months，因为 Glimpse 头 start)
- v1 付费版: 4-6 months
- PMF (如果能到): 6-12 months

---

## 16. 最后

今天对话的 arc 是从 "会不会没人用" 到 "不知道产品要怎么做好"。

后者比前者 **更 valuable**，因为：
- "会不会没人用" 是 outcome 焦虑
- "不知道怎么做好" 是 认知诚实

**认知诚实是 founder 最稀缺的资源**。

所有 framework 可以 evolve。所有 feature 可以 replace。所有 name 可以
change。但 **"在不确定的情况下 still proceed" 的能力是不可替代的**。

你今天 build 的不是 Convey。你今天 build 的是 **在这个 fuzzy 领域里能
继续推进的能力**。

---

*Document version: 0.1*
*To update when: post-Phase 1 validation with real user data*
*Reminder: next version should 删掉更多 framework，加更多 user quotes*
