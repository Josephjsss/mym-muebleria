import { company, whatsappHref } from "@/data/company";
import { UBICACION_MAPA } from "@/data/contacto";
import { Button } from "@/components/ui/button";
import { FacebookIcon } from "@/components/site/facebook-icon";
import { TikTokIcon } from "@/components/site/tiktok-icon";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";
import { Mail, MapPin, Navigation, Phone, User } from "lucide-react";

/** MAPA del sitio / sucursal (Google Maps) y datos de contacto. */
export function MapaSucursal() {
  const consulta = encodeURIComponent(UBICACION_MAPA);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="relative aspect-[4/3] w-full bg-muted lg:aspect-auto lg:min-h-72 lg:flex-1">
        <iframe
          title={`Mapa: ${company.name} en ${company.location}`}
          src={`https://www.google.com/maps?q=${consulta}&z=15&output=embed`}
          className="absolute inset-0 size-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>

      <div className="flex flex-col gap-4 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Nuestra tienda y taller</p>
          <h2 className="mt-1 font-heading text-lg font-semibold">{company.name}</h2>
        </div>

        <ul className="space-y-2.5 text-sm">
          <Dato icono={MapPin}>{company.location}</Dato>
          <Dato icono={Phone}>
            {company.whatsapp.map((numero, i) => (
              <span key={numero}>
                {i > 0 && " / "}
                <a
                  href={whatsappHref("Hola, quisiera información sobre sus muebles.", numero)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary hover:underline"
                >
                  {numero}
                </a>
              </span>
            ))}
          </Dato>
          <Dato icono={Mail}>
            <a href={`mailto:${company.contactEmail}`} className="hover:text-primary hover:underline">
              {company.contactEmail}
            </a>
          </Dato>
          <Dato icono={User}>
            {company.contactPerson.name} · {company.contactPerson.role}
          </Dato>
        </ul>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            nativeButton={false}
            render={
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${consulta}`}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <Navigation className="size-4" />
            Cómo llegar
          </Button>
          <Red href={whatsappHref()} etiqueta="WhatsApp">
            <WhatsAppIcon className="size-4" />
          </Red>
          <Red href={company.social.facebook} etiqueta="Facebook">
            <FacebookIcon className="size-4" />
          </Red>
          <Red href={company.social.tiktok} etiqueta="TikTok">
            <TikTokIcon className="size-4" />
          </Red>
        </div>
      </div>
    </div>
  );
}

function Dato({ icono: Icono, children }: { icono: typeof MapPin; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icono className="size-3.5" />
      </span>
      <span className="pt-1 text-muted-foreground">{children}</span>
    </li>
  );
}

function Red({ href, etiqueta, children }: { href: string; etiqueta: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={etiqueta}
      title={etiqueta}
      className="flex size-9 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
    >
      {children}
    </a>
  );
}
