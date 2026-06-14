import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { feedbackVoteSchema } from "@/lib/brand-schema";

export const runtime = "nodejs";
export const maxDuration = 10;

const feedbackDir = path.join(process.cwd(), "data");
const feedbackFile = path.join(feedbackDir, "feedback-votes.jsonl");

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const input = feedbackVoteSchema.parse(json);

    await mkdir(feedbackDir, { recursive: true });
    await appendFile(
      feedbackFile,
      `${JSON.stringify({
        inputText: input.inputText,
        timestamp: new Date().toISOString(),
        voteType: input.voteType,
      })}\n`,
      "utf8",
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "反馈内容格式不正确。" }, { status: 400 });
    }

    const message =
      error instanceof Error ? error.message : "保存反馈时发生错误，请稍后再试。";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
