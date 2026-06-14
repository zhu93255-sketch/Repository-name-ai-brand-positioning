import { BrandStudio } from "@/components/brand-studio";
import { getOpenAiConfigStatus } from "@/lib/env";

export default function Page() {
  const openAiConfig = getOpenAiConfigStatus();

  return (
    <BrandStudio
      openAiConfigured={openAiConfig.configured}
      openAiMessage={openAiConfig.message}
    />
  );
}
