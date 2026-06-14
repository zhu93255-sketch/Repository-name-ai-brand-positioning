import { BrandStudio } from "@/components/brand-studio";
import { getModelConfigStatus } from "@/lib/env";

export default function Page() {
  const modelConfig = getModelConfigStatus();

  return (
    <BrandStudio
      apiConfigured={modelConfig.configured}
      apiMessage={modelConfig.message}
    />
  );
}
