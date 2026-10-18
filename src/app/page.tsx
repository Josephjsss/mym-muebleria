import { Navbar } from "@/components/site/navbar";
import { Hero } from "@/components/site/hero";
import { CategoryIcons } from "@/components/site/category-icons";
import { AboutSection } from "@/components/site/about-section";
import { ProductsSection } from "@/components/site/products-section";
import { ClientsAlliesSection } from "@/components/site/clients-allies-section";
import { SiteFooter } from "@/components/site/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <div className="relative overflow-hidden bg-gradient-to-b from-secondary/45 via-background to-secondary/25">
          <div className="bg-dot-pattern pointer-events-none absolute inset-0 text-primary/[0.1]" />
          <div className="pointer-events-none absolute -left-24 top-[8%] size-80 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-24 top-[40%] size-96 rounded-full bg-secondary/70 blur-3xl" />
          <div className="pointer-events-none absolute left-1/4 top-[70%] size-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute right-1/3 top-[92%] size-64 rounded-full bg-[#84cc16]/25 blur-3xl" />
          <div className="relative">
            <CategoryIcons />
            <AboutSection />
            <ProductsSection />
            <ClientsAlliesSection />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
