"use client";

import { FormEvent, useMemo, useState } from "react";

import type { BrandStrategy } from "@/lib/brand-schema";

type FormState = {
  brandDescription: string;
};

type BrandStudioProps = {
  kimiConfigured: boolean;
  kimiMessage: string | null;
};

const initialForm: FormState = {
  brandDescription: "",
};

const promisePoints = [
  "找到品牌定位",
  "提炼核心卖点",
  "明确目标用户",
  "拆出差异化优势",
  "给出小红书内容方向",
];

const previewDirections = [
  "创始人故事切入",
  "用户痛点对照",
  "产品价值拆解",
];

const exampleInputs = [
  {
    label: "AI视频工具",
    value: "我做AI视频工具，帮助短视频团队批量生成口播视频，比剪映效率高5倍。",
  },
  {
    label: "小红书代运营",
    value: "我做小红书代运营，帮助新消费品牌从0到1搭建账号内容和投放策略，比内部团队试错更快拿到线索。",
  },
  {
    label: "宠物鲜食品牌",
    value: "我做宠物鲜食品牌，给养宠家庭提供更新鲜、更安心的主食方案，让宠物吃得更健康，也让主人更省心。",
  },
  {
    label: "独立设计工作室",
    value: "我做独立设计工作室，帮助创业品牌完成视觉识别和包装设计，让产品看起来更有质感、更容易卖出溢价。",
  },
  {
    label: "AI客服系统",
    value: "我做AI客服系统，帮助电商品牌自动回复高频咨询、减少人工客服压力，同时提升转化和响应速度。",
  },
];

const SHARE_CARD_WIDTH = 1200;
const SHARE_CARD_HEIGHT = 1500;
const SHARE_CARD_PADDING = 64;

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillStyle: string,
  strokeStyle?: string,
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();

  if (strokeStyle) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
) {
  const source = text.replace(/\s+/g, " ").trim();
  const chars = Array.from(source);
  const lines: string[] = [];
  let current = "";

  for (const char of chars) {
    const next = current + char;
    if (ctx.measureText(next).width <= maxWidth) {
      current = next;
      continue;
    }

    if (current) {
      lines.push(current);
      if (lines.length === maxLines) {
        const trimmed = `${lines[maxLines - 1].slice(0, Math.max(0, lines[maxLines - 1].length - 1))}…`;
        lines[maxLines - 1] = trimmed;
        return lines;
      }
    }

    current = char;
  }

  if (current && lines.length < maxLines) {
    lines.push(current);
  }

  return lines;
}

function drawTextBlock(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
  color: string,
) {
  const lines = wrapText(ctx, text, maxWidth, maxLines);
  ctx.fillStyle = color;
  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight);
  });

  return y + lines.length * lineHeight;
}

function normalizeShareText(text: string) {
  return text
    .replace(/[•·]/g, "")
    .replace(/\s+/g, " ")
    .replace(/，+/g, "，")
    .trim();
}

function clampShareText(text: string, maxChars: number) {
  const normalized = normalizeShareText(text);
  const chars = Array.from(normalized);
  if (chars.length <= maxChars) {
    return normalized;
  }

  return `${chars.slice(0, Math.max(0, maxChars - 1)).join("")}…`;
}

function pickShortPositioning(strategy: BrandStrategy) {
  const parts = strategy.brandPositioning.split(/[。！？!?\n]/).map((part) => part.trim()).filter(Boolean);
  return clampShareText(parts[0] || strategy.brandPositioning, 30);
}

function buildPositioningTags(strategy: BrandStrategy) {
  return [
    ...strategy.coreSellingPoints,
    ...strategy.userPersona.traits,
    ...strategy.differentiationAdvantages,
  ]
    .map((item) => clampShareText(item, 8))
    .filter((item, index, array) => item.length > 0 && array.indexOf(item) === index)
    .slice(0, 3);
}

function buildCoreInsight(strategy: BrandStrategy) {
  const positioning = pickShortPositioning(strategy).replace(/…$/, "");
  const firstAdvantage = clampShareText(strategy.differentiationAdvantages[0] || strategy.coreSellingPoints[0], 16);
  return clampShareText(`${positioning}，最值得强调的是${firstAdvantage}`, 36);
}

function buildShareSellingPoints(strategy: BrandStrategy) {
  return strategy.coreSellingPoints.slice(0, 4).map((item) => clampShareText(item, 12));
}

function buildSharePersonaSummary(strategy: BrandStrategy) {
  return clampShareText(strategy.userPersona.summary, 34);
}

function buildShareDifferentiators(strategy: BrandStrategy) {
  return strategy.differentiationAdvantages.slice(0, 4).map((item) => clampShareText(item, 15));
}

function buildValueSummary(strategy: BrandStrategy) {
  const firstPoint = clampShareText(strategy.coreSellingPoints[0] || "更清楚表达价值", 10);
  return clampShareText(`你现在拿到了更清楚的定位表达、${firstPoint}和可直接开做的小红书内容方向。`, 48);
}

export function BrandStudio({
  kimiConfigured,
  kimiMessage,
}: BrandStudioProps) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [generatedFrom, setGeneratedFrom] = useState<FormState | null>(null);
  const [strategy, setStrategy] = useState<BrandStrategy | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [isGeneratingShare, setIsGeneratingShare] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);

  const hasResults = useMemo(() => strategy !== null, [strategy]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setFeedbackError(null);
    setFeedbackSuccess(null);
    setCopyError(null);
    setCopySuccess(null);

    try {
      const response = await fetch("/api/brand-strategy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = (await response.json()) as {
        error?: string;
        strategy?: BrandStrategy;
      };

      if (!response.ok || !data.strategy) {
        throw new Error(data.error || "当前无法生成定位分析，请稍后再试。");
      }

      setStrategy(data.strategy);
      setGeneratedFrom({ ...form });
      setShareError(null);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "当前无法生成定位分析，请稍后再试。",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCopyResult() {
    if (!strategy) {
      return;
    }

    const copyText = [
      "一句话概括",
      strategy.oneSentencePitch,
      "",
      "品牌定位",
      strategy.brandPositioning,
      "",
      "核心卖点",
      ...strategy.coreSellingPoints.map((point) => `- ${point}`),
      "",
      "用户画像",
      strategy.userPersona.summary,
      ...strategy.userPersona.traits.map((trait) => `- ${trait}`),
      ...strategy.userPersona.painPoints.map((point) => `- ${point}`),
      "",
      "差异化优势",
      ...strategy.differentiationAdvantages.map((item) => `- ${item}`),
      "",
      "小红书内容方向",
      ...strategy.xiaohongshuContentDirections.flatMap((direction) => [
        direction.title,
        direction.description,
        ...direction.exampleTopics.map((topic) => `- ${topic}`),
      ]),
    ].join("\n");

    try {
      await navigator.clipboard.writeText(copyText);
      setCopyError(null);
      setCopySuccess("结果已复制到剪贴板。");
    } catch (copyResultError) {
      setCopySuccess(null);
      setCopyError(
        copyResultError instanceof Error
          ? copyResultError.message
          : "当前无法复制结果，请稍后再试。",
      );
    }
  }

  async function handleFeedbackVote(voteType: "helpful" | "unhelpful") {
    if (!generatedFrom) {
      setFeedbackError("请先生成结果，再提交反馈。");
      return;
    }

    setIsSubmittingFeedback(true);
    setFeedbackError(null);
    setFeedbackSuccess(null);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputText: generatedFrom.brandDescription,
          voteType,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "当前无法保存反馈，请稍后再试。");
      }

      setFeedbackSuccess("感谢反馈，我们已经记录。");
    } catch (feedbackSubmitError) {
      setFeedbackError(
        feedbackSubmitError instanceof Error
          ? feedbackSubmitError.message
          : "当前无法保存反馈，请稍后再试。",
      );
    } finally {
      setIsSubmittingFeedback(false);
    }
  }

  async function handleGenerateShareImage() {
    if (!strategy) {
      return;
    }

    setIsGeneratingShare(true);
    setShareError(null);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = SHARE_CARD_WIDTH;
      canvas.height = SHARE_CARD_HEIGHT;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("当前浏览器不支持生成分享图。");
      }

      const backgroundGradient = ctx.createLinearGradient(0, 0, SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT);
      backgroundGradient.addColorStop(0, "#fcf8f2");
      backgroundGradient.addColorStop(0.45, "#fffdf9");
      backgroundGradient.addColorStop(1, "#f3ede4");
      ctx.fillStyle = backgroundGradient;
      ctx.fillRect(0, 0, SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT);

      ctx.globalAlpha = 0.7;
      ctx.fillStyle = "#f4b189";
      ctx.beginPath();
      ctx.arc(180, 130, 180, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ddd4c6";
      ctx.beginPath();
      ctx.arc(1030, 190, 140, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      drawRoundedRect(
        ctx,
        42,
        42,
        SHARE_CARD_WIDTH - 84,
        SHARE_CARD_HEIGHT - 84,
        38,
        "rgba(255,255,255,0.88)",
        "rgba(210,201,188,0.9)",
      );

      let y = SHARE_CARD_PADDING + 10;

      drawRoundedRect(ctx, SHARE_CARD_PADDING, y, 166, 48, 24, "#f6eee2", "#dccfbe");
      ctx.fillStyle = "#6d5d4d";
      ctx.font = "600 22px 'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif";
      ctx.fillText("AI品牌定位助手", SHARE_CARD_PADDING + 22, y + 31);

      ctx.fillStyle = "#111827";
      ctx.font = "600 72px 'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif";
      y = drawTextBlock(
        ctx,
        "品牌定位分享图",
        SHARE_CARD_PADDING,
        y + 104,
        SHARE_CARD_WIDTH - SHARE_CARD_PADDING * 2,
        84,
        1,
        "#111827",
      );

      ctx.font = "400 28px 'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif";
      y = drawTextBlock(
        ctx,
        "适合小红书发布的 4:5 定位摘要卡片",
        SHARE_CARD_PADDING,
        y + 10,
        SHARE_CARD_WIDTH - SHARE_CARD_PADDING * 2,
        36,
        2,
        "#5f6673",
      );

      const contentTop = y + 28;
      const leftX = SHARE_CARD_PADDING;
      const rightX = SHARE_CARD_WIDTH / 2 + 10;
      const columnWidth = SHARE_CARD_WIDTH / 2 - SHARE_CARD_PADDING - 26;
      const positioningText = pickShortPositioning(strategy);
      const positioningTags = buildPositioningTags(strategy);
      const coreInsight = clampShareText(strategy.oneSentencePitch, 30) || buildCoreInsight(strategy);
      const shareSellingPoints = buildShareSellingPoints(strategy);
      const sharePersonaSummary = buildSharePersonaSummary(strategy);
      const shareDifferentiators = buildShareDifferentiators(strategy);
      const valueSummary = buildValueSummary(strategy);

      drawRoundedRect(
        ctx,
        SHARE_CARD_PADDING,
        contentTop,
        SHARE_CARD_WIDTH - SHARE_CARD_PADDING * 2,
        172,
        28,
        "#16181d",
      );
      ctx.fillStyle = "#ffb07d";
      ctx.font = "700 22px 'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif";
      ctx.fillText("核心洞察", SHARE_CARD_PADDING + 28, contentTop + 42);
      ctx.fillStyle = "#f8f9fc";
      ctx.font = "600 42px 'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif";
      drawTextBlock(
        ctx,
        coreInsight,
        SHARE_CARD_PADDING + 28,
        contentTop + 106,
        SHARE_CARD_WIDTH - SHARE_CARD_PADDING * 2 - 56,
        50,
        2,
        "#f8f9fc",
      );

      const upperTop = contentTop + 198;
      drawRoundedRect(ctx, leftX, upperTop, columnWidth, 282, 28, "#fffaf2", "#eadfce");
      ctx.fillStyle = "#d96d35";
      ctx.font = "700 22px 'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif";
      ctx.fillText("一句话定位", leftX + 28, upperTop + 40);
      ctx.fillStyle = "#202531";
      ctx.font = "600 40px 'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif";
      drawTextBlock(
        ctx,
        positioningText,
        leftX + 28,
        upperTop + 98,
        columnWidth - 56,
        48,
        2,
        "#202531",
      );

      positioningTags.forEach((tag, index) => {
        const tagWidth = 96 + Math.min(Array.from(tag).length, 6) * 20;
        const tagX = leftX + 28 + index * (tagWidth + 14);
        drawRoundedRect(ctx, tagX, upperTop + 194, tagWidth, 42, 20, "#f4ecdf");
        ctx.fillStyle = "#6d5d4d";
        ctx.font = "600 20px 'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif";
        drawTextBlock(ctx, tag, tagX + 18, upperTop + 221, tagWidth - 36, 24, 1, "#6d5d4d");
      });

      drawRoundedRect(ctx, rightX, upperTop, columnWidth, 282, 28, "#16181d");
      ctx.fillStyle = "#ffb07d";
      ctx.font = "700 22px 'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif";
      ctx.fillText("核心卖点", rightX + 28, upperTop + 40);
      const chipWidth = (columnWidth - 70) / 2;
      shareSellingPoints.forEach((point, index) => {
        const chipX = rightX + 22 + (index % 2) * (chipWidth + 14);
        const chipY = upperTop + 86 + Math.floor(index / 2) * 78;
        drawRoundedRect(ctx, chipX, chipY, chipWidth, 58, 22, "rgba(255,255,255,0.08)");
        ctx.fillStyle = "#f7f8fb";
        ctx.font = "600 24px 'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif";
        drawTextBlock(ctx, point, chipX + 18, chipY + 36, chipWidth - 36, 28, 1, "#f7f8fb");
      });

      const lowerTop = upperTop + 310;
      drawRoundedRect(ctx, leftX, lowerTop, columnWidth, 430, 28, "#16181d");
      ctx.fillStyle = "#ffb07d";
      ctx.font = "700 22px 'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif";
      ctx.fillText("用户画像", leftX + 28, lowerTop + 40);
      ctx.fillStyle = "#f6f7fb";
      ctx.font = "400 28px 'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif";
      let personaBottom = drawTextBlock(
        ctx,
        sharePersonaSummary,
        leftX + 28,
        lowerTop + 90,
        columnWidth - 56,
        38,
        4,
        "#f6f7fb",
      );

      personaBottom += 20;
      strategy.userPersona.traits.slice(0, 4).forEach((trait, index) => {
        const tagX = leftX + 28 + (index % 2) * ((columnWidth - 70) / 2 + 14);
        const tagY = personaBottom + Math.floor(index / 2) * 54;
        drawRoundedRect(ctx, tagX, tagY, (columnWidth - 70) / 2, 40, 18, "rgba(255,255,255,0.08)");
        ctx.fillStyle = "#e7eaf3";
        ctx.font = "500 20px 'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif";
        drawTextBlock(
          ctx,
          clampShareText(trait, 8),
          tagX + 16,
          tagY + 26,
          (columnWidth - 70) / 2 - 32,
          24,
          1,
          "#e7eaf3",
        );
      });

      drawRoundedRect(ctx, rightX, lowerTop, columnWidth, 430, 28, "#fffaf2", "#eadfce");
      ctx.fillStyle = "#d96d35";
      ctx.font = "700 22px 'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif";
      ctx.fillText("差异化优势", rightX + 28, lowerTop + 40);
      ctx.font = "500 25px 'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif";
      shareDifferentiators.forEach((point, index) => {
        const itemY = lowerTop + 92 + index * 84;
        drawRoundedRect(ctx, rightX + 22, itemY - 28, columnWidth - 44, 62, 20, "#fff", "#f0e4d4");
        ctx.fillStyle = "#202531";
        drawTextBlock(ctx, point, rightX + 42, itemY + 12, columnWidth - 84, 30, 1, "#202531");
      });

      const summaryTop = lowerTop + 458;
      drawRoundedRect(
        ctx,
        SHARE_CARD_PADDING,
        summaryTop,
        SHARE_CARD_WIDTH - SHARE_CARD_PADDING * 2,
        132,
        28,
        "#f6eee2",
        "#e4d7c6",
      );
      ctx.fillStyle = "#6d5d4d";
      ctx.font = "700 22px 'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif";
      ctx.fillText("本次分析带来的价值", SHARE_CARD_PADDING + 28, summaryTop + 42);
      ctx.fillStyle = "#202531";
      ctx.font = "500 28px 'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif";
      drawTextBlock(
        ctx,
        valueSummary,
        SHARE_CARD_PADDING + 28,
        summaryTop + 88,
        SHARE_CARD_WIDTH - SHARE_CARD_PADDING * 2 - 56,
        34,
        2,
        "#202531",
      );

      ctx.fillStyle = "#7b7368";
      ctx.font = "500 22px 'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif";
      ctx.fillText("5秒看懂定位，适合直接截图或发布到小红书", SHARE_CARD_PADDING, SHARE_CARD_HEIGHT - 108);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/png", 1);
      });

      if (!blob) {
        throw new Error("生成分享图失败，请稍后再试。");
      }

      const link = document.createElement("a");
      const brandPrefix = form.brandDescription.slice(0, 8).replace(/[^\p{L}\p{N}]+/gu, "") || "品牌定位";
      const objectUrl = URL.createObjectURL(blob);
      link.href = objectUrl;
      link.download = `${brandPrefix}-品牌定位分享图.png`;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch (shareImageError) {
      setShareError(
        shareImageError instanceof Error
          ? shareImageError.message
          : "生成分享图失败，请稍后再试。",
      );
    } finally {
      setIsGeneratingShare(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(237,119,56,0.16),_transparent_26%),linear-gradient(135deg,_#f8f5ef_0%,_#fffdf9_38%,_#f1efe8_100%)] text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid w-full gap-6 rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_32px_120px_rgba(22,24,27,0.12)] backdrop-blur sm:p-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-8 lg:p-10">
          <div className="flex flex-col justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center rounded-full border border-[#d8d2c8] bg-[#f7f1e8] px-3 py-1 text-xs font-semibold tracking-[0.18em] text-[#6e6458]">
                  AI品牌定位助手
                </div>
                {!kimiConfigured ? (
                  <div className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                    演示模式
                  </div>
                ) : null}
              </div>
              <h1 className="mt-4 max-w-xl font-serif text-4xl leading-[1.02] sm:text-5xl lg:text-6xl">
                不知道怎么介绍自己的产品？
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                输入一句产品描述，帮你快速整理定位、卖点和小红书内容方向。
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {promisePoints.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-stone-200 bg-[#fcfaf6] px-4 py-3 text-sm font-medium text-slate-700"
                >
                  {item}
                </div>
              ))}
            </div>

            <form className="space-y-4 rounded-[1.75rem] border border-stone-200 bg-[#faf8f3] p-5" onSubmit={handleSubmit}>
              {!kimiConfigured && kimiMessage ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                  当前为演示模式。未配置 Kimi 时，系统会返回一份可体验完整流程的模拟分析结果。
                </div>
              ) : null}

              <div>
                <p className="mb-3 text-sm font-semibold text-slate-800">
                  一键试试这些示例
                </p>
                <div className="flex flex-wrap gap-2">
                  {exampleInputs.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setForm({ brandDescription: item.value })}
                      className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[#cc6b34] hover:bg-orange-50 hover:text-slate-950"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="brandDescription">
                  请描述你的产品、客户是谁、为什么选择你
                </label>
                <textarea
                  id="brandDescription"
                  required
                  rows={7}
                  className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base outline-none transition focus:border-[#cc6b34] focus:ring-4 focus:ring-orange-100"
                  placeholder="例如：我做AI视频工具，帮助短视频团队批量生成口播视频，比剪映效率高5倍。"
                  value={form.brandDescription}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, brandDescription: event.target.value }))
                  }
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-[#111827] px-5 py-3.5 text-base font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isLoading ? "正在分析中..." : "帮我说清楚卖什么"}
              </button>

              <p className="text-center text-sm text-slate-500">
                平均30秒得到结果
              </p>

              <p className="text-sm leading-6 text-slate-500">
                结果会聚焦 5 项最关键内容：品牌定位、核心卖点、用户画像、差异化优势、小红书内容方向。
              </p>

              {error ? (
                <div
                  aria-live="polite"
                  className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              ) : null}
            </form>
          </div>

          <div className="flex min-h-[640px] flex-col rounded-[1.9rem] border border-stone-200 bg-[#121317] p-5 text-white sm:p-6">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-white/55">分析结果</p>
                <h2 className="mt-2 font-serif text-3xl">你的定位草案</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {!kimiConfigured ? (
                  <div className="rounded-full border border-amber-200/40 bg-amber-50/10 px-3 py-1 text-xs text-amber-100">
                    演示模式
                  </div>
                ) : null}
                <div className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70">
                  {hasResults ? "已生成" : "示例预览"}
                </div>
              </div>
            </div>

            {strategy ? (
              <div className="mt-5 flex flex-1 flex-col gap-4 overflow-hidden">
                <div className="rounded-3xl bg-white/[0.04] p-4">
                  <p className="text-xs font-semibold tracking-[0.18em] text-orange-200/90">一句话定位</p>
                  <p className="mt-2 text-lg font-semibold leading-8 text-white">
                    {strategy.oneSentencePitch}
                  </p>
                </div>

                <div className="rounded-3xl bg-white/[0.04] p-4">
                  <p className="text-xs font-semibold tracking-[0.18em] text-orange-200/90">品牌定位</p>
                  <p className="mt-2 text-sm leading-7 text-white/90">{strategy.brandPositioning}</p>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-3xl bg-white/[0.04] p-4">
                    <p className="text-xs font-semibold tracking-[0.18em] text-orange-200/90">核心卖点</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {strategy.coreSellingPoints.map((point) => (
                        <span
                          key={point}
                          className="rounded-full bg-white/[0.08] px-3 py-1.5 text-sm text-white/85"
                        >
                          {point}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl bg-white/[0.04] p-4">
                    <p className="text-xs font-semibold tracking-[0.18em] text-orange-200/90">差异化优势</p>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-white/85">
                      {strategy.differentiationAdvantages.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="rounded-3xl bg-white/[0.04] p-4">
                    <p className="text-xs font-semibold tracking-[0.18em] text-orange-200/90">用户画像</p>
                    <p className="mt-2 text-sm leading-7 text-white/90">{strategy.userPersona.summary}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {strategy.userPersona.traits.map((trait) => (
                        <span
                          key={trait}
                          className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/75"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-white/80">
                      {strategy.userPersona.painPoints.map((point) => (
                        <li key={point}>• {point}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-3xl bg-white/[0.04] p-4">
                    <p className="text-xs font-semibold tracking-[0.18em] text-orange-200/90">小红书内容方向</p>
                    <div className="mt-3 space-y-3">
                      {strategy.xiaohongshuContentDirections.map((direction) => (
                        <article key={direction.title} className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                          <h3 className="text-sm font-semibold text-white">{direction.title}</h3>
                          <p className="mt-1 text-sm leading-6 text-white/75">{direction.description}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {direction.exampleTopics.map((topic) => (
                              <span
                                key={topic}
                                className="rounded-full bg-white/[0.08] px-3 py-1 text-xs text-white/80"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">结果操作</p>
                      <p className="mt-1 text-sm text-white/65">
                        一键复制完整结果，或下载适合小红书分享的 4:5 图片卡片。
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => void handleCopyResult()}
                        className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-black/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/8"
                      >
                        复制结果
                      </button>
                      <button
                        type="button"
                        onClick={handleGenerateShareImage}
                        disabled={isGeneratingShare}
                        className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:bg-stone-400 disabled:text-white/80"
                      >
                        {isGeneratingShare ? "生成中..." : "下载分享图"}
                      </button>
                    </div>
                  </div>

                  {shareError ? (
                    <div className="mt-3 rounded-2xl border border-red-300/25 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                      {shareError}
                    </div>
                  ) : null}
                  {copyError ? (
                    <div className="mt-3 rounded-2xl border border-red-300/25 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                      {copyError}
                    </div>
                  ) : null}
                  {copySuccess ? (
                    <div className="mt-3 rounded-2xl border border-emerald-300/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                      {copySuccess}
                    </div>
                  ) : null}
                </div>

                <div className="mt-auto rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-sm font-semibold text-white">这个结果对你有帮助吗？</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => void handleFeedbackVote("helpful")}
                      disabled={isSubmittingFeedback}
                      className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:bg-stone-400 disabled:text-white/80"
                    >
                      有帮助
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleFeedbackVote("unhelpful")}
                      disabled={isSubmittingFeedback}
                      className="rounded-2xl border border-white/10 bg-black/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/8 disabled:cursor-not-allowed disabled:bg-stone-500 disabled:text-white/70"
                    >
                      没帮助
                    </button>
                  </div>

                  {feedbackError ? (
                    <div className="mt-3 rounded-2xl border border-red-300/25 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                      {feedbackError}
                    </div>
                  ) : null}

                  {feedbackSuccess ? (
                    <div className="mt-3 rounded-2xl border border-emerald-300/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                      {feedbackSuccess}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="mt-5 flex flex-1 flex-col justify-between gap-4">
                <div className="rounded-3xl bg-white/[0.04] p-5">
                  <p className="text-xs font-semibold tracking-[0.18em] text-orange-200/90">你将拿到什么</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {[
                      "品牌定位",
                      "核心卖点",
                      "用户画像",
                      "差异化优势",
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/80"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl bg-white/[0.04] p-5">
                  <p className="text-xs font-semibold tracking-[0.18em] text-orange-200/90">小红书方向示例</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {previewDirections.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-white/75"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-dashed border-white/12 bg-white/[0.03] p-5">
                  <p className="text-lg font-semibold text-white">适合谁来用</p>
                  <p className="mt-2 text-sm leading-7 text-white/70">
                    新品牌冷启动、已有产品但说不清差异化、准备做小红书增长、需要快速梳理定位表达的中国创业者。
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
