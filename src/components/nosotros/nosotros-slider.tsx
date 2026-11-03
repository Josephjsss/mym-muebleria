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

// Slider de la página Nosotros: 3 imágenes (requisito del Avance 3).
const slides = [
  {
    image: "/images/armado-1.jpg",
    etiqueta: "Nosotros",
    titulo: "Un taller que crece con Quilmaná",
    texto: "Más de 5 años fabricando muebles en melamina a la medida de cada hogar.",
  },
  {
    image: "/images/slider-diseno.png",
    etiqueta: "Equipo del proyecto",
    titulo: "Estudiantes UTP + M&M Mueblería",
    texto: "Desarrollamos su catálogo web junto al equipo del taller.",
  },
  {
    image: "/images/comedor-sala-1.jpg",
    etiqueta: "Nuestro trabajo",
    titulo: "Del diseño a la instalación",
    texto: "Cotización, fabricación, armado e instalación en tu casa.",
  },
];

export function NosotrosSlider() {
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
      aria-label="Sobre nosotros"
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
