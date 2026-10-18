import { company } from "@/data/company";
import { Separator } from "@/components/ui/separator";
import { Reveal } from "@/components/reactbits/Reveal";
import { Users, Handshake, Clapperboard, Quote, Star } from "lucide-react";
import LogoLoop from "@/components/reactbits/LogoLoop";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

const clientVideos = [
  { src: "/videos/cliente-1.mp4", title: "Closet instalado" },
  { src: "/videos/cliente-2.mp4", title: "Cocina instalada" },
  { src: "/videos/cliente-3.mp4", title: "Repostero instalado" },
];

export function ClientsAlliesSection() {
  return (
    <section className="relative py-16">
      <div className="relative mx-auto max-w-6xl px-4">
        <div>
          <Reveal>
            <div className="flex items-center gap-2 text-primary">
              <Users className="size-5" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Confían en nosotros
              </span>
            </div>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              Clientes
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Quiénes confían en nosotros y qué adquieren con mayor frecuencia.
            </p>
          </Reveal>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {company.clients.map((c, i) => (
              <Reveal key={c.type} delay={i * 0.1}>
                <div className="h-full rounded-xl border bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
                  <p className="text-sm font-semibold text-primary">{c.type}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {c.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2}>
            <div className="mt-10">
              <div className="flex items-center gap-2 text-primary">
                <Quote className="size-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Testimonios
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Lo que dicen quienes ya confiaron en nuestro trabajo.
              </p>
              <Carousel
                opts={{ align: "start", loop: true }}
                className="mt-4 px-1 sm:px-10"
              >
                <CarouselContent>
                    {company.testimonials.map((t) => (
                      <CarouselItem
                        key={t.name}
                        className="sm:basis-1/2 lg:basis-1/3"
                      >
                        <SpotlightCard
                          className="h-full rounded-xl p-0"
                          spotlightColor="rgba(13, 148, 136, 0.2)"
                        >
                          <div className="group flex h-full flex-col rounded-xl border-t-4 border-t-transparent bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-t-primary hover:shadow-lg hover:shadow-primary/10">
                            <Quote className="size-5 shrink-0 text-primary/40 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-125 group-hover:text-primary/70" />
                            <p className="mt-2 flex-1 text-sm text-muted-foreground">
                              “{t.quote}”
                            </p>
                            <div className="mt-4 flex items-center justify-between gap-2">
                              <div>
                                <p className="text-sm font-semibold">{t.name}</p>
                                <p className="text-xs text-muted-foreground">{t.location}</p>
                              </div>
                              <div className="flex shrink-0 gap-0.5 text-secondary-foreground transition-transform duration-300 group-hover:scale-110">
                                {Array.from({ length: t.rating }).map((_, s) => (
                                  <Star key={s} className="size-3.5 fill-current" />
                                ))}
                              </div>
                            </div>
                          </div>
                        </SpotlightCard>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                <CarouselPrevious className="border-primary/30 text-primary" />
                <CarouselNext className="border-primary/30 text-primary" />
              </Carousel>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-10">
              <div className="flex items-center gap-2 text-primary">
                <Clapperboard className="size-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Trabajos entregados
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Proyectos reales instalados en casa de nuestros clientes.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {clientVideos.map((v, i) => (
                  <Reveal key={v.src} delay={i * 0.08}>
                    <div className="group overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                      <video
                        src={v.src}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="aspect-[9/16] w-full bg-muted object-cover"
                      />
                      <p className="p-3 text-center text-xs font-medium text-muted-foreground">
                        {v.title}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <Separator className="my-12" />

        <div>
          <Reveal>
            <div className="flex items-center gap-2 text-primary">
              <Handshake className="size-5" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Aliados
              </span>
            </div>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              Proveedores y aliados
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Trabajamos con marcas reconocidas a nivel nacional.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="relative mt-6 w-full overflow-hidden">
              <LogoLoop
                logos={company.allies.map((a) => ({
                  src: a.logo,
                  alt: a.name,
                  title: a.name,
                  href: a.url,
                }))}
                speed={70}
                direction="left"
                logoHeight={56}
                gap={64}
                fadeOut
                fadeOutColor="var(--card)"
                scaleOnHover
                pauseOnHover
                ariaLabel="Proveedores y aliados"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
