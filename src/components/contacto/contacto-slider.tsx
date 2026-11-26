"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { slidesContacto as slides } from "@/data/contacto";

// Slider de la página Contacto: 4 imágenes (el requisito es de 3 a 6).
export function ContactoSlider() {
  const [api, setApi] = useState<CarouselApi>();
  const [actual, setActual] = useState(0);

  useEffect(() => {
    if (!api) return;
    const alCambiar = () => setActual(api.selectedScrollSnap());
    api.on("select", alCambiar);
    return () => {
      api.off("select", alCambiar);
    };
  }, [api]);

  return (
    <Carousel
      setApi={setApi}
      opts={{ loop: true }}
      plugins={[Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })]}
      className="group/slider"
      aria-label="Contacto"
    >
      <CarouselContent>
        {slides.map((s, i) => (
          <CarouselItem key={s.titulo}>
            <div className="relative h-60 overflow-hidden rounded-2xl shadow-lg shadow-primary/10 sm:h-80">
              <Image
                src={s.image}
                alt={s.titulo}
                fill
                sizes="(min-width: 1152px) 1120px, 100vw"
                priority={i === 0}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0f2a27]/90 via-[#0f2a27]/55 to-transparent" />
              <div className="relative flex h-full max-w-lg flex-col justify-center p-6 text-white sm:p-10">
                <span className="w-fit rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                  {s.etiqueta}
                </span>
                <h2 className="mt-3 text-2xl font-bold sm:text-3xl">{s.titulo}</h2>
                <p className="mt-2 text-sm text-white/80 sm:text-base">{s.texto}</p>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious className="left-3 border-white/30 bg-black/30 text-white opacity-0 backdrop-blur transition-opacity hover:bg-black/50 hover:text-white group-hover/slider:opacity-100" />
      <CarouselNext className="right-3 border-white/30 bg-black/30 text-white opacity-0 backdrop-blur transition-opacity hover:bg-black/50 hover:text-white group-hover/slider:opacity-100" />

      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
        {slides.map((s, i) => (
          <button
            key={s.titulo}
            type="button"
            onClick={() => api?.scrollTo(i)}
            aria-label={`Ir a la imagen ${i + 1}: ${s.titulo}`}
            className={cn(
              "h-2 rounded-full transition-all",
              actual === i ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
            )}
          />
        ))}
      </div>
    </Carousel>
  );
}
