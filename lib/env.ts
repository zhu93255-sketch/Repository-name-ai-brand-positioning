const PLACEHOLDER_VALUES = new Set([
  "",
  "your_openai_api_key_here",
  "replace_with_openai_api_key",
]);

function hasConfiguredValue(value: string | undefined) {
  return Boolean(value && !PLACEHOLDER_VALUES.has(value.trim()));
}

export function getOpenAiConfigStatus() {
  const configured = hasConfiguredValue(process.env.OPENAI_API_KEY);

  return {
    configured,
    message: configured
      ? null
      : "OpenAI 尚未完成配置。请先在 .env.local 中填入真实的 OPENAI_API_KEY，本地确认无误后，再把同样的变量添加到 Vercel。",
  };
}
