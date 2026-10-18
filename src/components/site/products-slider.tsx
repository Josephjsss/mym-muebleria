"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Slider de la página de productos: 4 banners (requisito: de 3 a 5 como máximo).
// Cada botón abre el catálogo filtrado por su categoría.
const slides = [
  {
    image: "/images/slider-roperos.png",
    etiqueta: "Dormitorio",
    titulo: "Roperos a tu medida",
    texto: "Con zapatera, cajoneras y maleteros. Entrega en 7 días.",
    categoria: "Roperos",
  },
  {
    image: "/images/slider-cocinas.png",
    etiqueta: "Cocina",
    titulo: "Cocinas integrales",
    texto: "En L, en U o con isla: diseñadas según tu espacio real.",
    categoria: "Cocinas",
  },
  {
    image: "/images/slider-closets.png",
    etiqueta: "Closets",
    titulo: "Closets de piso a techo",
    texto: "Puertas corredizas, cajoneras e iluminación interior.",
    categoria: "Closets",
  },
  {
    image: "/images/slider-diseno.png",
    etiqueta: "Servicios",
    titulo: "Diseño y cotización gratis",
    texto: "Vamos a tu casa, tomamos medidas y te damos un presupuesto.",
    categoria: "Servicios",
  },
];

export function ProductsSlider() {
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
      plugins={[Autoplay({ delay: 4500, stopOnInteraction: false, stopOnMouseEnter: true })]}
      className="group/slider"
      aria-label="Productos destacados"
    >
      <CarouselContent>
        {slides.map((s, i) => (
          <CarouselItem key={s.titulo}>
            <div className="relative h-56 overflow-hidden rounded-2xl shadow-lg shadow-primary/10 sm:h-72">
              <Image
                src={s.image}
                alt={s.titulo}
                fill
                sizes="(min-width: 1152px) 1120px, 100vw"
                priority={i === 0}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0f2a27]/90 via-[#0f2a27]/60 to-transparent" />
              <div className="relative flex h-full max-w-md flex-col justify-center p-6 text-white sm:p-10">
                <span className="w-fit rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                  {s.etiqueta}
                </span>
                <h2 className="mt-3 text-2xl font-bold sm:text-3xl">{s.titulo}</h2>
                <p className="mt-2 text-sm text-white/80 sm:text-base">{s.texto}</p>
                <Link
                  href={`/productos?categoria=${encodeURIComponent(s.categoria)}`}
                  scroll={false}
                  className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90"
                >
                  Ver {s.categoria.toLowerCase()}
                  <ArrowRight className="size-4" />
                </Link>
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
            aria-label={`Ir al banner ${i + 1}: ${s.titulo}`}
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
