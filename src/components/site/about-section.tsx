import { company } from "@/data/company";
import { Reveal } from "@/components/reactbits/Reveal";
import { VideoPlayer } from "@/components/site/video-player";
import { Target, ListChecks, Compass, Flag } from "lucide-react";

export function AboutSection() {
  return (
    <section id="nosotros" className="relative py-16">
      <div className="relative mx-auto max-w-6xl px-4">
        <div className="grid gap-10 md:grid-cols-2 md:items-start">
          <Reveal>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Nuestra historia
              </span>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                Sobre nosotros
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {company.location}
              </p>
              <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {company.about}
              </div>
            </div>
          </Reveal>

          <div className="flex flex-col gap-6">
            <Reveal delay={0.1}>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Video representativo
                </h3>
                <VideoPlayer
                  src="/videos/entrevista-taller.mp4"
                  poster="/images/entrevista-poster.jpg"
                  className="mt-3 aspect-video w-full rounded-lg border bg-black object-cover"
                />
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="group rounded-xl border border-primary/20 bg-primary/5 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
                  <div className="flex items-center gap-1.5 text-primary">
                    <Compass className="size-4 transition-transform duration-500 group-hover:rotate-45" />
                    <p className="font-semibold">Misión</p>
                  </div>
                  <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
                    {company.mission}
                  </p>
                </div>
                <div className="group rounded-xl border border-secondary bg-secondary/50 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex items-center gap-1.5 text-secondary-foreground">
                    <Flag className="size-4 transition-transform duration-300 group-hover:scale-125" />
                    <p className="font-semibold">Visión</p>
                  </div>
                  <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
                    {company.vision}
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        <Reveal delay={0.1}>
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            <div className="group rounded-xl border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                  <Target className="size-4" />
                </span>
                <p className="text-sm font-semibold">Objetivos principales</p>
              </div>
              <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
                {company.objectives.main.map((o) => (
                  <li key={o} className="flex gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    {o}
                  </li>
                ))}
              </ul>
            </div>
            <div className="group rounded-xl border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-transform duration-300 group-hover:scale-110">
                  <ListChecks className="size-4" />
                </span>
                <p className="text-sm font-semibold">Objetivos específicos</p>
              </div>
              <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
                {company.objectives.specific.map((o) => (
                  <li key={o} className="flex gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-secondary-foreground/50" />
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
