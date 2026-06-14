const PLACEHOLDER_VALUES = new Set([
  "",
  "your_deepseek_api_key_here",
  "replace_with_deepseek_api_key",
  "your_kimi_api_key_here",
  "replace_with_kimi_api_key",
]);

function hasConfiguredValue(value: string | undefined) {
  return Boolean(value && !PLACEHOLDER_VALUES.has(value.trim()));
}

export function getModelConfigStatus() {
  const configured = hasConfiguredValue(process.env.DEEPSEEK_API_KEY?.trim() || process.env.KIMI_API_KEY?.trim());

  return {
    configured,
    message: configured
      ? null
      : "DeepSeek 尚未完成配置。请先在 .env.local 中填入真实的 DEEPSEEK_API_KEY，本地确认无误后，再把同样的变量添加到 Vercel。",
  };
}

export function getModelApiKey() {
  return process.env.DEEPSEEK_API_KEY?.trim() || process.env.KIMI_API_KEY?.trim() || "";
}

export function getModelBaseUrl() {
  const baseUrl = process.env.DEEPSEEK_BASE_URL?.trim() || process.env.KIMI_BASE_URL?.trim();
  return baseUrl && baseUrl.length > 0 ? baseUrl : "https://api.deepseek.com";
}

export function getModelName() {
  return process.env.DEEPSEEK_MODEL?.trim() || process.env.KIMI_MODEL?.trim() || "deepseek-v4-flash";
}
