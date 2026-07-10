import type { CampaignFeature } from "@/lib/menu-campaigns";

import { StaggerContainer, StaggerItem } from "./MotionEffects";

export function CampaignFeatureStrip({
  features,
}: {
  features: CampaignFeature[];
}) {
  return (
    <StaggerContainer className="mx-auto grid max-w-[98dvw] grid-cols-1 border-y border-border bg-card/40 px-4 md:max-w-[95dvw] md:grid-cols-2 xl:max-w-[85dvw] xl:grid-cols-4 xl:px-0">
      {features.map((feature, index) => {
        const Icon = feature.icon;

        return (
          <StaggerItem key={feature.title}>
            <div className="flex flex-col items-center gap-4 px-0 py-6 text-center sm:px-4 xl:flex-row xl:items-center xl:text-left xl:px-8">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-gold-soft text-secondary shadow-[var(--shadow-soft-icon)] transition-transform duration-500 hover:scale-110">
                <Icon className="size-7" strokeWidth={1.8} />
              </span>
              <div className="min-w-0">
                <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-foreground">
                  {feature.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {feature.description}
                </p>
              </div>
              {index < features.length - 1 ? (
                <span className="ml-auto hidden h-20 w-px bg-border xl:block" />
              ) : null}
            </div>
          </StaggerItem>
        );
      })}
    </StaggerContainer>
  );
}
