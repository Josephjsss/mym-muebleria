import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Fuente de títulos: más carácter y peso que el sans de cuerpo, para que la
// jerarquía se note (encabezados, nombres, precios, etiquetas destacadas).
const headingSans = Plus_Jakarta_Sans({
  variable: "--font-heading-sans",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "M&M Mueblería y Taller en Melamine",
  description:
    "Fabricantes de muebles en melamina a medida en Quilmaná, Cañete. Roperos, closets, cocinas, dormitorios y más.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      // Next 16: al cambiar de página el scroll vuelve arriba al instante
      // (sin esto, el scroll suave dejaba el inicio al final al salir de /admin).
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${headingSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
