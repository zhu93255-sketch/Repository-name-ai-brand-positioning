import { NextResponse } from "next/server";

import {
  brandRequestSchema,
  type BrandStrategy,
  brandStrategySchema,
} from "@/lib/brand-schema";
import { getKimiConfigStatus, getKimiBaseUrl } from "@/lib/env";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = process.env.KIMI_MODEL || "kimi-k2.6";

function pickFirstMatchedSegment(
  description: string,
  patterns: string[],
  fallback: string,
) {
  return patterns.find((item) => description.includes(item)) || fallback;
}

function clampByCharacters(text: string, maxChars: number) {
  const chars = Array.from(text.trim());
  if (chars.length <= maxChars) {
    return chars.join("");
  }

  return chars.slice(0, maxChars).join("");
}

function extractMessageContent(content: unknown) {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (item && typeof item === "object" && "text" in item && typeof item.text === "string") {
          return item.text;
        }

        return "";
      })
      .join("\n")
      .trim();
  }

  return "";
}

function extractJsonObject(rawText: string) {
  const cleaned = rawText
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    let depth = 0;
    let start = -1;

    for (let index = 0; index < cleaned.length; index += 1) {
      const char = cleaned[index];
      if (char === "{") {
        if (depth === 0) {
          start = index;
        }
        depth += 1;
      } else if (char === "}") {
        depth -= 1;
        if (depth === 0 && start >= 0) {
          const segment = cleaned.slice(start, index + 1);
          return JSON.parse(segment);
        }
      }
    }
  }

  throw new Error("模型没有返回可解析的 JSON。");
}

function normalizeText(value: unknown, fallback: string, maxChars?: number) {
  const text = typeof value === "string" ? value.trim() : "";
  const safeText = text || fallback;
  return typeof maxChars === "number" ? clampByCharacters(safeText, maxChars) : safeText;
}

function normalizeTextList(value: unknown, fallback: string[], minItems: number, maxItems: number, maxChars: number) {
  const list = Array.isArray(value)
    ? value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
        .map((item) => clampByCharacters(item, maxChars))
    : [];

  const merged = [...list];
  for (const item of fallback) {
    if (merged.length >= maxItems) {
      break;
    }
    if (!merged.includes(item)) {
      merged.push(clampByCharacters(item, maxChars));
    }
  }

  return merged.slice(0, Math.max(minItems, maxItems)).slice(0, maxItems);
}

function normalizeStrategy(candidate: unknown, brandDescription: string): BrandStrategy {
  const fallback = buildMockStrategy(brandDescription);
  const source = candidate && typeof candidate === "object" ? candidate : {};
  const sourceRecord = source as Record<string, unknown>;
  const sourcePersona =
    sourceRecord.userPersona && typeof sourceRecord.userPersona === "object"
      ? (sourceRecord.userPersona as Record<string, unknown>)
      : {};

  const sourceDirections = Array.isArray(sourceRecord.xiaohongshuContentDirections)
    ? sourceRecord.xiaohongshuContentDirections
    : [];

  const normalized: BrandStrategy = {
    oneSentencePitch: normalizeText(
      sourceRecord.oneSentencePitch,
      fallback.oneSentencePitch,
      30,
    ),
    brandPositioning: normalizeText(sourceRecord.brandPositioning, fallback.brandPositioning),
    coreSellingPoints: normalizeTextList(
      sourceRecord.coreSellingPoints,
      fallback.coreSellingPoints,
      3,
      5,
      32,
    ),
    userPersona: {
      summary: normalizeText(sourcePersona.summary, fallback.userPersona.summary),
      traits: normalizeTextList(sourcePersona.traits, fallback.userPersona.traits, 3, 5, 18),
      painPoints: normalizeTextList(
        sourcePersona.painPoints,
        fallback.userPersona.painPoints,
        3,
        5,
        30,
      ),
    },
    differentiationAdvantages: normalizeTextList(
      sourceRecord.differentiationAdvantages,
      fallback.differentiationAdvantages,
      3,
      5,
      30,
    ),
    xiaohongshuContentDirections: sourceDirections
      .map((item, index) => {
        const fallbackDirection =
          fallback.xiaohongshuContentDirections[index] ||
          fallback.xiaohongshuContentDirections[fallback.xiaohongshuContentDirections.length - 1];
        const record = item && typeof item === "object" ? (item as Record<string, unknown>) : {};

        return {
          title: normalizeText(record.title, fallbackDirection.title, 20),
          description: normalizeText(record.description, fallbackDirection.description, 80),
          exampleTopics: normalizeTextList(
            record.exampleTopics,
            fallbackDirection.exampleTopics,
            2,
            3,
            28,
          ),
        };
      })
      .filter((item) => item.title && item.description)
      .slice(0, 5),
  };

  if (normalized.xiaohongshuContentDirections.length < 3) {
    normalized.xiaohongshuContentDirections = fallback.xiaohongshuContentDirections;
  }

  if (Array.from(normalized.oneSentencePitch).length < 15) {
    normalized.oneSentencePitch = fallback.oneSentencePitch;
  }

  return brandStrategySchema.parse(normalized);
}

function buildMockStrategy(brandDescription: string): BrandStrategy {
  const description = brandDescription.trim();
  const lowerDescription = description.toLowerCase();
  const shortAudience =
    pickFirstMatchedSegment(
      description,
      ["创业团队", "创始人", "老板", "主理人", "团队", "女生", "妈妈", "学生", "商家", "品牌方"],
      "创业团队",
    );

  const audience =
    pickFirstMatchedSegment(
      description,
      ["创始人", "老板", "主理人", "团队", "女生", "妈妈", "学生", "商家", "品牌方"],
      "对增长效率和结果更敏感的中国创业者",
    );

  const category = pickFirstMatchedSegment(
    description,
    ["AI", "视频", "SaaS", "护肤", "教育", "课程", "工具", "咨询", "咖啡", "服饰", "电商"],
    "细分赛道产品",
  );

  const emphasis = lowerDescription.includes("效率")
    ? "效率提升"
    : lowerDescription.includes("便宜") || lowerDescription.includes("低价")
      ? "更高性价比"
      : lowerDescription.includes("专业") || lowerDescription.includes("高端")
        ? "更专业可信"
        : "更直接的结果价值";

  return {
    oneSentencePitch: clampByCharacters(`帮助${shortAudience}更快获得${emphasis}的${category}工具`, 30),
    brandPositioning: `这是一个面向${audience}的${category}品牌，核心不是泛泛提供功能，而是用更清晰、更可感知的方式帮助用户获得${emphasis}，在用户心中占据“更快见效、更容易决策”的位置。`,
    coreSellingPoints: [
      "把复杂能力包装成用户一听就懂的结果承诺",
      "比常见替代方案更快落地，减少试错和执行成本",
      "更适合中国创业团队的使用场景与增长节奏",
      "强调效率、结果和可复制，而不是空泛功能堆砌",
    ],
    userPersona: {
      summary: `目标用户通常是正在寻找更高效率方案的${audience}，他们对结果敏感，希望更快验证方向，同时不愿意为复杂流程和高试错成本买单。`,
      traits: [
        "时间紧，决策速度快",
        "更关注投入产出比",
        "愿意尝试新工具或新方案",
        "对内容传播和转化结果敏感",
      ],
      painPoints: [
        "现有方案效率不够高，执行成本高",
        "市场上同类选择太多，很难快速判断差异",
        "需要更容易传播的卖点表达，帮助成交和转化",
        "希望用更少的人力拿到更稳定的结果",
      ],
    },
    differentiationAdvantages: [
      "从“功能描述”转成“结果表达”，更容易打动用户",
      "定位更聚焦，不再和所有同类产品正面混战",
      "更符合中国内容平台和社交传播的表达习惯",
      "能把产品价值直接转成用户可理解的购买理由",
    ],
    xiaohongshuContentDirections: [
      {
        title: "用户痛点对照",
        description: "用用户熟悉的旧方案和你的新方案做前后对比，突出效率、成本或结果差异。",
        exampleTopics: [
          "为什么很多团队还在用低效方案做这件事",
          "同样一件事，我们为什么能快 5 倍",
          "换掉旧流程后，团队节省了哪些时间成本",
        ],
      },
      {
        title: "结果案例拆解",
        description: "展示真实使用前后变化，让用户快速感受到你的价值不是抽象概念。",
        exampleTopics: [
          "一个客户从试用到复购，中间发生了什么",
          "我们帮团队把哪一步提速了，结果提升多少",
          "真实场景下，这个产品最值得买的地方是什么",
        ],
      },
      {
        title: "创始人认知输出",
        description: "用创始人视角解释你为什么这样做产品，顺便建立专业信任。",
        exampleTopics: [
          "我们为什么不做大而全，而只解决一个关键问题",
          "这个赛道里，用户最容易被忽略的真实需求是什么",
          "如果重新做一遍，我们会优先把什么做到极致",
        ],
      },
    ],
  };
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const input = brandRequestSchema.parse(json);
    const kimiConfig = getKimiConfigStatus();

    if (!kimiConfig.configured) {
      return NextResponse.json({
        demoMode: true,
        strategy: buildMockStrategy(input.brandDescription),
      });
    }

    const completionResponse = await fetch(`${getKimiBaseUrl()}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.KIMI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        response_format: {
          type: "json_object",
        },
        messages: [
          {
            role: "system",
            content: `
你是一位擅长服务中国创业者和新消费品牌的资深品牌定位顾问。
请基于用户提供的品牌信息，输出能直接用于传播和市场验证的定位建议。
语言必须简洁、具体、像真正的操盘手建议，避免空话、套话和 AI 腔。
所有结果都请使用简体中文。

输出要求：
- oneSentencePitch：用一句 15 到 30 字的话概括品牌价值。
- oneSentencePitch 必须同时体现目标用户和产品价值。
- oneSentencePitch 用户看完可直接用于微信简介、官网标题、路演介绍、小红书主页简介。
- oneSentencePitch 不要使用空话、套话，不要出现“赋能”“一站式”“全方位”这类泛化表达。
- brandPositioning：1 段话，说清这个品牌应该占据什么位置。
- coreSellingPoints：3 到 5 条，可直接用于首页、海报或销售沟通。
- userPersona.summary：1 段话概括目标用户是谁。
- userPersona.traits：3 到 5 个用户特征。
- userPersona.painPoints：3 到 5 个用户痛点或购买动机。
- differentiationAdvantages：3 到 5 条差异化优势，强调为什么用户会选它而不是别家。
- xiaohongshuContentDirections：3 到 5 个小红书内容方向。
- 每个小红书内容方向都要包含 title、description、exampleTopics。
- exampleTopics 提供 2 到 3 个可直接拿去写笔记的选题。
请只返回严格合法的 JSON 对象，不要包含 Markdown、解释文字或代码块。
          `.trim(),
          },
          {
            role: "user",
            content: `
品牌描述：${input.brandDescription}

请输出一份适合中国创业者使用的品牌定位分析，重点帮这个品牌找到：
1. 一句话价值概括
2. 品牌定位
3. 核心卖点
4. 用户画像
5. 差异化优势
6. 小红书内容方向
其中“一句话价值概括”必须让用户看完就知道：这是给谁的，值在哪里。
          `.trim(),
          },
        ],
      }),
    });

    const completionJson = await completionResponse.json();

    if (!completionResponse.ok) {
      const errorMessage =
        completionJson?.error?.message ||
        completionJson?.message ||
        "Kimi 接口调用失败，请稍后再试。";

      return NextResponse.json({ error: errorMessage }, { status: completionResponse.status });
    }

    const rawContent = extractMessageContent(completionJson?.choices?.[0]?.message?.content);

    if (!rawContent) {
      return NextResponse.json(
        { error: "模型没有返回可解析的文本结果。" },
        { status: 502 },
      );
    }

    let parsedStrategy: BrandStrategy;

    try {
      parsedStrategy = normalizeStrategy(extractJsonObject(rawContent), input.brandDescription);
    } catch {
      return NextResponse.json(
        { error: "模型没有返回符合要求的结构化定位分析结果。" },
        { status: 502 },
      );
    }

    if (!parsedStrategy) {
      return NextResponse.json(
        { error: "模型没有返回符合要求的结构化定位分析结果。" },
        { status: 502 },
      );
    }

    return NextResponse.json({ demoMode: false, strategy: parsedStrategy });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "请检查表单输入是否完整且格式正确。" }, { status: 400 });
    }

    const message =
      error instanceof Error ? error.message : "生成定位分析时发生错误，请稍后再试。";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
