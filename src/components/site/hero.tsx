"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import FloatingLines from "@/components/reactbits/FloatingLines";
import DepthCarousel from "@/components/reactbits/DepthCarousel";
import { whatsappHref } from "@/data/company";
import { MessageCircle, Hammer } from "lucide-react";

// Fotos propias para la grilla de fondo (GridMotion) — se repiten para llenar
// las 28 celdas de la grilla.
const heroBackgroundImages = [
  "/images/ropero-1.png",
  "/images/cama-1.jpg",
  "/images/closet-4.jpg",
  "/images/repostero-1.jpg",
  "/images/cocina-3.jpg",
  "/images/ropero-2.png",
  "/images/cama-3.jpg",
  "/images/closet-3.jpg",
  "/images/repostero-3.jpg",
  "/images/cocina-1.png",
  "/images/ropero-3.png",
  "/images/cama-2.jpg",
  "/images/closet-1.jpg",
  "/images/repostero-2.jpg",
];

// Slider de portada: 5 imágenes (requisito: de 3 a 5).
const slides = [
  { image: "/images/ropero-2.png", alt: "Roperos a medida" },
  { image: "/images/cama-1.jpg", alt: "Camas tapizadas" },
  { image: "/images/closet-4.jpg", alt: "Closets a medida" },
  { image: "/images/repostero-2.jpg", alt: "Reposteros" },
  { image: "/images/cocina-3.jpg", alt: "Cocinas integrales" },
];

export function Hero() {
  return (
    <section id="inicio" className="relative isolate overflow-hidden bg-background">
      {/* Líneas de tinta con parallax (reactbits FloatingLines), en colores de marca */}
      <div className="pointer-events-none absolute inset-0">
        <FloatingLines
          enabledWaves={["top", "middle", "bottom"]}
          lineCount={[10, 14, 8]}
          lineDistance={[2, 1.4, 2]}
          animationSpeed={1.6}
          interactive
          parallax
          parallaxStrength={0.2}
          bendRadius={6}
          bendStrength={-1.6}
          linesGradient={["#0d9488", "#84cc16", "#134e4a"]}
          lightMode
        />
      </div>

      {/* Velo apenas perceptible, solo para que el texto no choque con una línea; se funde con el verde claro que sigue en el resto de la página */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-background/10 to-secondary/45" />

      {/* Cinta diagonal de marca, inspirada en el flyer de la empresa */}
      <div className="brand-ribbon pointer-events-none absolute -right-10 -top-24 h-72 w-full bg-gradient-to-br from-primary to-secondary opacity-20 sm:h-96" />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-20">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground shadow-sm">
            <Hammer className="size-3.5" />
            Taller y mueblería en Quilmaná, Cañete
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Muebles a tu medida,{" "}
            <span className="bg-gradient-to-r from-primary to-secondary-foreground bg-clip-text text-transparent">
              hechos para durar
            </span>
          </h1>
          <p className="mt-4 max-w-md text-sm text-muted-foreground sm:text-base">
            Diseñamos y fabricamos muebles en melamina para el hogar y
            oficinas: modelos estándar o proyectos personalizados según el
            espacio real de tu casa.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" nativeButton={false} className="shadow-md shadow-primary/20" render={<Link href="/productos" />}>
              Ver productos
            </Button>
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              render={<a href={whatsappHref()} target="_blank" rel="noopener noreferrer" />}
            >
              <MessageCircle className="size-4" />
              Cotiza por WhatsApp
            </Button>
          </div>
        </div>

        <div className="mx-auto w-full">
          <div className="mb-3 flex justify-center">
            <span className="inline-flex items-center rounded-full border bg-card px-3 py-1.5 text-xs font-semibold shadow-sm">
              <span className="text-primary">+5 años</span>&nbsp;fabricando a medida
            </span>
          </div>

          <div className="relative h-[420px] w-full">
            <DepthCarousel
              items={slides}
              depth={160}
              spread={70}
              tilt={18}
              tiltDirection="right"
              perspective={1200}
              visibleCards={3}
              falloff={0.22}
              blur={5}
              autoplay
              autoplayDelay={3500}
              loop
              cardWidth={230}
              cardHeight={306}
              radius={20}
              tint="#0f2a27"
              duration={650}
              ease="power3.out"
              showControls
              showIndicators
            />
          </div>
        </div>
      </div>
    </section>
  );
}
