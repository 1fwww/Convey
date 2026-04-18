
# Convey — 我的想法（纯手写 + 对话整理）

*最后更新：2026-04-17*
*注：这是我自己的想法记录。跟 CONVEY_DISCOVERY.md 不同，那份文档是跟 AI 长对话的产物，里面有些 principle 是 AI 包装出来的，我没仔细审核。这份以这里为准。*

---

## 我是谁

- 中文母语，non-native English speaker
- Tech 行业 PM，6 年工作经验
- 日常沟通（Slack, messages, emails）大量使用 AI proofread/rewrite

---

## 我现在怎么用 AI

三种模式，取决于我对那条消息的 confidence level：

**模式 1：我写好了，帮我 polish**
- 自己写完，paste 到 ChatGPT，给指令："proofread it, make it flow better, more concise, use my tone, make it more natural"
- 对应心态：我觉得大致 ok，只需要打磨

**模式 2：我写好了，但不确定 tone**
- 自己写完，交代 context 和关系（写给谁，什么关系，想表达什么感觉），让 AI improve
- 对应心态：知道想说什么，但不确定说出来感觉对不对

**模式 3：我不知道怎么用英语开口**
- 只交代情景和 context（比如"同事被 layoff 了，给我发了 xxx，我应该怎么回复"），让 AI 先写，我再改
- 对应心态：脑子里有完整的意图和判断，卡在英语输出层。不是不知道说什么，是不知道用英语怎么说。AI 写了之后，我能 judge 合不合适。

**三种模式都是 valid 的。** 核心判断标准不是"用户自己写了多少"，而是"最终发出去的东西是不是用户认可的、能代表自己的"。

---

## 我的痛点（三层）

**表层：流程繁琐**
- copy → paste → copy back → re-edit → re-paste → re-edit → send
- 来回切窗口，一条消息搞 8 步

**中层：can tell what feels like, but hard to get it "feel right"**
- 有大概的想法，但不知道怎么 articulate / convey 出来
- 能感觉到"哪里不对"，但说不清楚不对在哪

**深层：焦虑 + 成长需求**
- 焦虑和矛盾：不用 AI → 怕发出去的东西不 make sense。用 AI → 怕听起来不像我。
- 用了 AI 之后对自己的英语 **更没信心了**。AI 每次给你看"更好的版本"，你看到 diff 会想"原来我写的不够好" — 意识到了问题，但没有成长，就只剩焦虑。
- 自我成长需求：一直用 AI 表达能力会不会退化？writing 退化会不会影响 speaking？

---

## 一个关键发现：我的 "proofread" 根本不是 proofread

分析了我的 ChatGPT 历史后发现：我几乎从不问语法问题。我实际在做的是 **tone calibration + impact preview**。我问过 GPT "how does it feel"、要求 "easier to read"、用中文解释"就是想催一下" — 都是在校准 tone 和预判对方会怎么理解。

这意味着：市场上可能有大量 non-native professional 也在说"I just need proofreading"，但真正的需求是更深的东西。他们（包括我）不知道怎么描述自己的需求，因为语言里没有现成的词。

---

## Comprehension > Production 的不对称

我的英语理解力远大于表达力。我能读懂 native speaker 的 Slack 消息，能判断一段话 tone 对不对，但让我从零产出同样水平的东西，我卡住。

这不是"英语不好"的问题，是 comprehension 和 production 之间有 gap。Convey 要做的是帮用户缩小这个 gap。用多了之后，以前需要模式 3 的场景，模式 2 就够了。这就是成长。

---

## AI 擅长做什么（产品的机会）

**1. 发现用户自己没注意到的 pattern**
- 比如：AI 发现我跟同事 A 说话感叹号特别多，跟同事 B 就不会
- 这种 insight 用户自己不 obvious，但被 flag 之后会有 aha moment
- 关键：这不涉及对错判断。"你跟 A 感叹号多"不是错误，是 observation
- 这种 insight 增加 self-awareness，不损伤 confidence — 完美解决"提高能力和提高信心的矛盾"

**2. Tone calibration**
- AI 对 tone 的判断虽然不完美，但能给出"大概率的解读方向"
- 可能没有绝对的 right（3 个人读同一段话可能解读不同），但有绝对的 wrong
- AI 至少能帮你避开明显的 wrong

**3. General language knowledge**
- Grammar, slang, conventions, cultural context
- 这些是 AI 已经很强的领域

**4. 展示用户自己的成长**
- 你这个月的 run-on sentence 比上个月少了
- 你想表达关心的时候最自然，想表达 pushback 的时候会变得过度 formal
- 最好的参照物是用户自己的巅峰状态，不是别人

---

## AI 做不到什么（产品的边界）

- 判断这句话发给 **这个特定的人** 是否合适 — 因为不知道你们的关系
- 替你决定你 **想成为什么样的沟通者** — 这是用户自己的事
- 完全理解语言的 nuance — 语言太 personal，包含 self identity、power dynamics、cultural background
- 沟通的灵魂来自于人，AI 无法取代

**AI 做 pattern detection 和 observation，用户做 meaning-making 和 decision。** 产品的线就画在这里。

---

## 核心理念

- 市场上绝大部分 AI 工具帮人 get things done，很少有 help you actually write better。对 non-native 群体，除了 get things done，还有隐含的 self improvement 需求。
- 出了学校就没有专门的老师教 how to communicate，但这个需求隐形存在。我自己是在 work context 下，通过阅读同事的 writing，理解、模仿、内化，才逐渐提升的。但这个过程 passive、缓慢、不系统。
- **Convey 要做的是加速这个已经在发生的过程** — 不是创造新的学习方式，而是让这个 passive 过程变 active、变 systematic。
- **产品必须有记忆。** 没有记忆的 AI 写作工具就是我用了一年的 ChatGPT proofread — 有用但不成长。只有记住用户的 pattern、常见问题、style 变化，才能真正帮用户进步。
- **先 affirm 再 suggest。** 不是"这句话可以改成 X"，而是"这句话意图传达得很清楚，如果想让语气再轻松一点，可以试试 X"。先确认表达是 work 的，再给 optional 升级。

---

## 对 CONVEY_DISCOVERY.md 的修正

那份文档有些 principle 是 AI 对话中生成的，我没有仔细审核。以下是我明确不同意或需要修改的：

- **"Forgetful, not surveilling" — 不同意。** 产品必须有记忆才能真正帮用户成长。隐私可以通过其他方式解决（用户控制、只存 pattern 不存 content 等），但 forgetful 不是答案。
- **其他 principle 待审核。** 对每个 principle 要问自己："这是我想的，还是听起来很对所以我没反驳？"

---

## 还不清楚的事

- 产品到底能做到多深？语言太 nuanced，这个边界只能通过做来发现
- 三层痛点（繁琐 / feel right / 成长），产品初版应该主攻哪层？
- 记忆功能怎么设计？用户主动 feed？只存 pattern？定期体检？
- 怎么让 insight 不 feel intrusive / judgmental？

这些不确定性不会通过继续想来减少。

---

## 2026-04-17 数据分析发现

用 ChatGPT 导出的完整历史（4976 条对话，其中 1773 条 proofread 相关）做了深度分析。

### 核心结论：3 年 3000 次 AI proofread，英语水平呈轻微下降趋势

- 用 Claude 和 GPT-4o 两个模型做 blind evaluation（480 条样本，6 个维度，randomized，calibrated prompt with anchor examples）
- 两个模型都显示 **早期（2023）分数高于晚期（2025-2026）**：
  - Claude: 2023 平均 ~7.82 → 2025-2026 平均 ~7.55（下降 ~0.27）
  - GPT-4o: 2023 平均 ~8.12 → 2025-2026 平均 ~7.46（下降 ~0.66）
- **方向一致的轻微下降，不是持平。** 3000 次 correction 不但没有转化成能力提升，水平可能还在倒退
- Caveat：场景混合（简历 vs Slack vs 技术说明）、工作环境变化可能是 confounding factor，但趋势本身是两个独立模型共同看到的
- GPT 91% 的回复只是给改写，不解释 why

### 我的英语 profile

**强项（始终最高）：**
- Register fit（8.2-8.5）— 我很擅长在不同场景选对 tone，casual Slack vs formal email 切换自如
- Clarity（7.6-8.4）— 表达基本清晰

**弱项（始终最低）：**
- Expression range（6.7-7.8）— 句式单一，"I think" 是最常用的句首（2025 年 34 次），hedging 词汇有限
- Grammar（6.9-8.2）— article 错误是最 persistent 的问题

**我的 8 类常见问题（flag 一次就能记住的那种）：**
1. Spelling/typo — 打字快没检查
2. Article (a/an/the) — 中文没有冠词系统，三年没改善
3. 中文直译用词 — "I just knew"（应该是 learned/found out）、"wearing a cloth of"（披着外衣）
4. 主谓一致 — "experience are"、"who have been"
5. "I thought" 代替 "I think" — 表达当下观点用过去时（"我觉得" → "I thought"）
6. Run-on sentence — 逗号一路连下去不断句，越来越严重
7. 小词丢失 — 漏 "it"、"to"、"there's"
8. 句子写一半

其中 **3（中文直译）和 5（I thought vs I think）** 最适合 Convey — 解释一次用户就懂，但 ChatGPT 从来不解释。

**我的 writing style fingerprint：**
- "Hey [Name]!" 开头 + "wanted to" / "heads up" 软化 + lowercase "i" + 括号补充 + 温暖结尾
- Casual register 比 formal register 更像自己 — 正式邮件反而失去 voice
- 过度 softener — 甚至在报告好消息时也在道歉式软化（"just wanted to update you quickly"）

### 使用 pattern 发现

- **Proofread 占 ChatGPT 总用量的 20-73%**，2024 年 3 月峰值，之后下降
- **工作时间 10:00-16:00 有 45-54% 的对话是 proofread**，周末只有 11% — 纯 work-driven
- **33% 是 one-shot（改了就走），67% 有来回**
- **High stakes 消息平均 11.9 轮对话，low stakes 只有 3.1 轮**
- **22% 的对话里我会编辑 GPT 的输出再提交回去** — 880 次

### 对产品的 implications

1. **"3 年 3000 次没成长" 是 Convey 最强的 validation** — 不是猜测，是我自己的数据
2. **分数不是产品价值** — 所有 B2-C1 的 non-native professional 分数都差不多。价值在 personalized insight 和具体问题的解释
3. **场景混合会影响评估** — 简历、cover letter、Slack 消息、技术说明混在一起评分没意义。Convey 如果做 "英语体检"，需要按场景分开看
4. **这套分析 pipeline 本身可能就是产品功能的雏形** — 抽样 + blind eval + unblind + 出 profile
5. **数据可能有学术价值** — 目前没有 working professional 在真实工作场景下的纵向 AI writing 研究

### 产品方向的新想法（来自今天的讨论）

- **Re-edit space** 是产品核心 — 不只是编辑器，同时是学习空间和数据源
- **编辑模式 vs 回顾模式** — 写的时候快速帮你 get things done，闲下来的时候给你 insight 和成长轨迹
- **Writing style profile** — 包含 style（你怎么写）、taste（你觉得什么好）、growth（你在怎么变）
- **Profile 数据自然产生** — 用户在 re-edit space 里使用产品就在 feed profile，不需要额外操作
- **Clipboard 格式适配** — macOS clipboard 支持同时放 plain text + HTML + markdown，目标 app 自动选。Convey 知道用户从哪个 app 来，可以自动适配

### 分析方法论的反思

- LLM blind eval 比 rule-based grammar checker 更接近 "英语到底好不好" 这个问题
- 但 LLM 评分有 bias（不愿给低分），需要 anchor examples + calibrated prompt
- Cross-model validation（Claude + GPT-4o）增加可信度
- 样本量从 210 → 480 结论变稳定了，但 prompt 质量比样本量更重要
- 场景混合、消息长度、内容类型都是 confounding variable，需要控制

---

### 产品 UX 的几个 realization

**为什么我用了 Gemini inline 还是回到 ChatGPT：**
- Gemini 给你 control（几个固定按钮），但没有反馈，只给改好的版本，体验很 dry
- ChatGPT friction 更大（copy-paste），但更 open-ended（自然语言 prompt）且有反馈（虽然浅）
- Inline 改写会 **挤压 re-edit 空间** — 原地替换，你没机会对比和调整

**三层差异化：**
| | 效率 | 反馈 |
|---|---|---|
| Gemini inline | 最高 | 无 |
| ChatGPT | 低 | 有但浅 |
| Convey | 中间 | 深 |

**跨 app copy-paste 的格式损失是真实的 pain：**
- 从 Slack copy 到 GPT：bullet points 打乱、formatting 丢失，GPT 看到的不是你写的原样
- 从 GPT copy 回 Slack：格式又不对，还得手动调
- 每次 proofread 有两次格式损失 — 这个 pain 比 "AI 反馈不够深" 更 immediate
- Screenshot capture（Glimpse 已有）可以解决第一次损失 — AI 看到的是你在 app 里实际看到的样子

**Re-edit space + AI 的结合本身就是 UX 创新：**
- 目前 re-edit（Notes）和 AI feedback（ChatGPT）是分开的两个地方
- 把它们合成一个 — 你在编辑的同时 AI 在旁边给反馈 — 这个形态没人做过
- 不是先写好再问 AI，也不是 AI 直接改好给你

---

### UI Mockup 方向（2026-04-17）

做了 HTML mockup（mockup.html），用 Glimpse 的 design tokens（Outfit 字体、品牌紫、light mode）。

**核心 UI 概念 — "Paper"**
- 一张白色的纸是编辑主体，用户在上面写和改
- Editor 是绝对主角 — 最大字号、最多空间、最强存在感
- Previous versions 在 paper 上方，用虚线分隔，灰色淡化，hover 显示 "Restore"
- AI version 是小 overlay / 虚线框，临时性的，用户可选择 adopt 或 dismiss
- Toolbar 在 paper 顶部（Slack 风格：B/I/S、链接、列表、引用、代码）
- Paper 固定大小，内容在 paper 内部滚动，展开/折叠不改变容器尺寸

**右侧 insight panel**
- Affirm（做得好的地方）+ Flashcard（建议）
- Flashcard 自动存储，不强制即时查看
- 用户行为决定 mode：30 秒改完发出去 = quick mode，反复改看卡片 = learning mode
- 不需要显式切换

**为什么不做 Grammarly 的 inline 模式**
- Grammarly 的 always-on 红线对 B2-C1 用户来说是打扰不是帮助
- 用户用了 Gemini inline 觉得 UX 好但还是回 ChatGPT — 因为需要 open-ended control 和反馈
- Inline 模式挤压 re-edit 空间 — 原地替换让用户没机会对比和调整
- Convey = user-initiated，你叫它才来

**关键 UX insight**
- Friction 不是敌人，wrong friction 才是
- 去掉无意义的 friction（copy-paste、格式丢失、切窗口）
- 保留有意义的 friction（自己改、自己判断、自己决定）
- 跨 app copy-paste 有两次格式损失 — screenshot capture 可以解决第一次
- Grammarly 68% 用户是 native speaker — Convey 和 Grammarly 不是竞品，服务不同人群

---

*下一步：找 3 个 non-native PM，每人 15 分钟，只听。今天的数据分析和 UI mockup 都不能替代那个。*
