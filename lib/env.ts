const PLACEHOLDER_VALUES = new Set([
  "",
  "your_kimi_api_key_here",
  "replace_with_kimi_api_key",
  "https://api.moonshot.ai/v1",
]);

function hasConfiguredValue(value: string | undefined) {
  return Boolean(value && !PLACEHOLDER_VALUES.has(value.trim()));
}

export function getKimiConfigStatus() {
  const configured = hasConfiguredValue(process.env.KIMI_API_KEY);

  return {
    configured,
    message: configured
      ? null
      : "Kimi 尚未完成配置。请先在 .env.local 中填入真实的 KIMI_API_KEY，本地确认无误后，再把同样的变量添加到 Vercel。",
  };
}

export function getKimiBaseUrl() {
  const baseUrl = process.env.KIMI_BASE_URL?.trim();
  return baseUrl && baseUrl.length > 0 ? baseUrl : "https://api.moonshot.ai/v1";
}
