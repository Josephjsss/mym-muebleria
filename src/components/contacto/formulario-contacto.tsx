"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import { enviarMensaje, type EstadoFormulario } from "@/app/contacto/actions";
import { ASUNTOS } from "@/data/contacto";
import { whatsappHref } from "@/data/company";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";
import { CheckCircle2, Loader2, Send } from "lucide-react";

const claseCampo =
  "w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

/** FORMULARIO DE CONTACTO: el mensaje se guarda en la BD (tabla mensajes_contacto). */
export function FormularioContacto() {
  const [estado, accion, enviando] = useActionState<EstadoFormulario, FormData>(enviarMensaje, null);
  const formulario = useRef<HTMLFormElement>(null);

  // Al enviar con éxito se limpia el formulario; si hay error, se conserva lo escrito.
  useEffect(() => {
    if (estado?.ok) formulario.current?.reset();
  }, [estado]);

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
      <h2 className="font-heading text-xl font-semibold">Escríbenos</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Déjanos tu consulta y te respondemos por correo o WhatsApp.
      </p>

      <form
        ref={formulario}
        onSubmit={(e) => {
          e.preventDefault();
          const datos = new FormData(e.currentTarget);
          startTransition(() => accion(datos));
        }}
        className="mt-5 grid gap-4 sm:grid-cols-2"
      >
        {/* Campo trampa anti-spam (oculto para personas). */}
        <input type="text" name="sitio_web" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

        <Campo id="c-nombre" etiqueta="Nombre *">
          <Input id="c-nombre" name="nombre" required minLength={2} maxLength={100} autoComplete="name" placeholder="Tu nombre" />
        </Campo>
        <Campo id="c-correo" etiqueta="Correo *">
          <Input id="c-correo" name="correo" type="email" required maxLength={150} autoComplete="email" placeholder="tucorreo@correo.com" />
        </Campo>
        <Campo id="c-telefono" etiqueta="Celular (opcional)">
          <Input id="c-telefono" name="telefono" type="tel" maxLength={20} autoComplete="tel" placeholder="9xx xxx xxx" />
        </Campo>
        <Campo id="c-asunto" etiqueta="Asunto *">
          <select id="c-asunto" name="asunto" required defaultValue="Cotización" className={claseCampo + " h-8"}>
            {ASUNTOS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </Campo>
        <Campo id="c-mensaje" etiqueta="Mensaje *" className="sm:col-span-2">
          <textarea
            id="c-mensaje"
            name="mensaje"
            required
            minLength={10}
            maxLength={2000}
            rows={5}
            placeholder="Ej. Quiero un ropero de 2 m de ancho en color nogal…"
            className={claseCampo + " resize-y"}
          />
        </Campo>

        {estado && (
          <p
            role={estado.ok ? "status" : "alert"}
            className={
              "flex items-start gap-2 rounded-lg px-3 py-2 text-sm sm:col-span-2 " +
              (estado.ok ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive")
            }
          >
            {estado.ok && <CheckCircle2 className="mt-0.5 size-4 shrink-0" />}
            {estado.mensaje}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <Button type="submit" size="lg" disabled={enviando} className="shadow-md shadow-primary/20">
            {enviando ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Enviar mensaje
          </Button>
          <a
            href={whatsappHref()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <WhatsAppIcon className="size-4 text-[#25D366]" />
            o escríbenos por WhatsApp
          </a>
        </div>
      </form>
    </div>
  );
}

function Campo({
  id,
  etiqueta,
  className,
  children,
}: {
  id: string;
  etiqueta: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={"flex flex-col gap-1.5 " + (className ?? "")}>
      <Label htmlFor={id}>{etiqueta}</Label>
      {children}
    </div>
  );
}
