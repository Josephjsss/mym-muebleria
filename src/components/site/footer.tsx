import { Mail, Phone, MapPin } from "lucide-react";
import { TikTokIcon } from "@/components/site/tiktok-icon";
import { FacebookIcon } from "@/components/site/facebook-icon";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";
import { company, whatsappHref } from "@/data/company";
import Image from "next/image";

export function SiteFooter() {
  return (
    <footer id="contacto" className="relative overflow-hidden bg-gradient-to-br from-[#134e4a] via-[#0f2a27] to-[#0a1f1c] text-white">
      <div className="brand-ribbon-reverse pointer-events-none absolute -top-10 right-0 h-48 w-72 bg-gradient-to-br from-secondary/30 to-primary/20" />

      <div className="relative mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-semibold">
              <span className="relative flex size-9 items-center justify-center overflow-hidden rounded-md bg-white ring-1 ring-white/20">
                <Image src="/images/logo-mark.png" alt="Logo M&M" fill sizes="36px" className="object-contain p-1" />
              </span>
              {company.shortName}
            </div>
            <p className="mt-3 text-sm text-white/70">
              {company.tagline}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">Contacto</p>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0" /> {company.location}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4 shrink-0" />
                <span>
                  {company.whatsapp.map((numero, i) => (
                    <span key={numero}>
                      {i > 0 && " / "}
                      <a
                        href={whatsappHref("Hola, quisiera información sobre sus muebles.", numero)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-colors hover:text-white hover:underline"
                      >
                        {numero}
                      </a>
                    </span>
                  ))}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4 shrink-0" /> {company.contactEmail}
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">Contacto real (trabajador)</p>
            <p className="mt-3 text-sm text-white/70">
              {company.contactPerson.name}
              <br />
              {company.contactPerson.role}
              <br />
              {company.contactEmail}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">Síguenos</p>
            <div className="mt-3 flex items-center gap-3">
              <a
                href={whatsappHref()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex size-9 items-center justify-center rounded-full border border-white/20 transition-colors hover:border-[#25D366] hover:bg-[#25D366]"
              >
                <WhatsAppIcon className="size-4" />
              </a>
              <a
                href={company.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex size-9 items-center justify-center rounded-full border border-white/20 transition-colors hover:bg-white/10"
              >
                <FacebookIcon className="size-4" />
              </a>
              <a
                href={company.social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="flex size-9 items-center justify-center rounded-full border border-white/20 transition-colors hover:bg-white/10"
              >
                <TikTokIcon className="size-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col-reverse items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-white/60">
            © {new Date().getFullYear()} {company.name}. Proyecto académico —
            Herramientas de Desarrollo, UTP.
          </p>
          <a
            href="https://www.utp.edu.pe/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Universidad Tecnológica del Perú"
            className="relative h-8 w-32 rounded-md bg-white p-1.5 transition-opacity hover:opacity-90"
          >
            <Image
              src="/images/utp-logo.webp"
              alt="Universidad Tecnológica del Perú"
              fill
              sizes="128px"
              className="object-contain p-1"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
