import { BrandStudio } from "@/components/brand-studio";
import { getKimiConfigStatus } from "@/lib/env";

export default function Page() {
  const kimiConfig = getKimiConfigStatus();

  return (
    <BrandStudio
      kimiConfigured={kimiConfig.configured}
      kimiMessage={kimiConfig.message}
    />
  );
}
