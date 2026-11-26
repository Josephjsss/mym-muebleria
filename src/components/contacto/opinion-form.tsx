"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { enviarOpinion, type EstadoFormulario } from "@/app/contacto/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CheckCircle2, Loader2, MessageSquarePlus, Star } from "lucide-react";

const ETIQUETAS = ["", "Malo", "Regular", "Bueno", "Muy bueno", "Excelente"];

/** Formulario para que un cliente deje su opinión (se guarda en la tabla opiniones). */
export function OpinionForm() {
  const [estado, accion, enviando] = useActionState<EstadoFormulario, FormData>(enviarOpinion, null);
  const [calificacion, setCalificacion] = useState(5);
  const [encima, setEncima] = useState(0);
  const formulario = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado?.ok) formulario.current?.reset();
  }, [estado]);

  const mostrada = encima || calificacion;

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm lg:sticky lg:top-20">
      <div className="flex items-center gap-2">
        <MessageSquarePlus className="size-5 text-primary" />
        <h3 className="font-heading text-base font-semibold">Deja tu opinión</h3>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">¿Ya compraste con nosotros? Cuéntanos tu experiencia.</p>

      <form
        ref={formulario}
        onSubmit={(e) => {
          e.preventDefault();
          const datos = new FormData(e.currentTarget);
          startTransition(() => accion(datos));
        }}
        className="mt-4 flex flex-col gap-3"
      >
        <input type="text" name="sitio_web" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
        <input type="hidden" name="calificacion" value={calificacion} />

        <fieldset>
          <legend className="text-sm font-medium">Calificación *</legend>
          <div className="mt-1 flex items-center gap-2">
            <div className="flex" onMouseLeave={() => setEncima(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCalificacion(n)}
                  onMouseEnter={() => setEncima(n)}
                  aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
                  aria-pressed={calificacion === n}
                  className="p-0.5"
                >
                  <Star
                    className={cn(
                      "size-6 transition-colors",
                      n <= mostrada ? "fill-amber-400 text-amber-400" : "fill-muted text-muted-foreground/30"
                    )}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">{ETIQUETAS[mostrada]}</span>
          </div>
        </fieldset>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="o-nombre">Nombre *</Label>
            <Input id="o-nombre" name="nombre" required minLength={2} maxLength={80} placeholder="Tu nombre" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="o-ciudad">Ciudad</Label>
            <Input id="o-ciudad" name="ciudad" maxLength={80} placeholder="Ej. Imperial" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="o-comentario">Tu opinión *</Label>
          <textarea
            id="o-comentario"
            name="comentario"
            required
            minLength={10}
            maxLength={600}
            rows={4}
            placeholder="¿Qué te pareció el mueble y la atención?"
            className="w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>

        {estado && (
          <p
            role={estado.ok ? "status" : "alert"}
            className={cn(
              "flex items-start gap-2 rounded-lg px-3 py-2 text-sm",
              estado.ok ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
            )}
          >
            {estado.ok && <CheckCircle2 className="mt-0.5 size-4 shrink-0" />}
            {estado.mensaje}
          </p>
        )}

        <Button type="submit" disabled={enviando}>
          {enviando ? <Loader2 className="size-4 animate-spin" /> : <Star className="size-4" />}
          Publicar opinión
        </Button>
      </form>
    </div>
  );
}
