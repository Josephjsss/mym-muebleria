"use client";

import { Shirt, BedDouble, Archive, DoorClosed, CookingPot, Wrench, type LucideIcon } from "lucide-react";
import { company } from "@/data/company";
import { Reveal } from "@/components/reactbits/Reveal";
import WarmTooltip, { WarmTooltipGroup } from "@/components/reactbits/WarmTooltip";

const ICONS: Record<string, LucideIcon> = {
  shirt: Shirt,
  bed: BedDouble,
  archive: Archive,
  door: DoorClosed,
  kitchen: CookingPot,
  service: Wrench,
};

export function CategoryIcons() {
  return (
    <section className="relative">
      <div className="relative mx-auto grid max-w-6xl grid-cols-3 gap-3 px-4 py-8 sm:grid-cols-6 sm:gap-4">
        <WarmTooltipGroup delay={250} warmWindow={400}>
          {company.categories.map((cat, i) => {
            const Icon = ICONS[cat.icon];
            return (
              <Reveal key={cat.name} delay={i * 0.06}>
                <WarmTooltip
                  content={`Ver ${cat.name}`}
                  side="top"
                  surfaceColor="#0d9488"
                  inkColor="#ffffff"
                  arrow
                >
                  <a
                    href={`/productos?categoria=${encodeURIComponent(cat.name)}`}
                    className="group flex flex-col items-center gap-2 rounded-lg p-2 text-center transition-transform duration-200 hover:-translate-y-1"
                  >
                    <span className="flex size-14 items-center justify-center rounded-full bg-white text-primary shadow-md transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/40">
                      <Icon className="size-6" />
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {cat.name}
                    </span>
                  </a>
                </WarmTooltip>
              </Reveal>
            );
          })}
        </WarmTooltipGroup>
      </div>
    </section>
  );
}
