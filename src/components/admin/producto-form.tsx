"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { guardarProducto, type ResultadoAccion } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Categoria, Producto } from "@/lib/types";
import { ImagePlus, Loader2, Save, UploadCloud } from "lucide-react";

const claseCampo =
  "w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

/**
 * Formulario de REGISTRAR / EDITAR producto.
 * La imagen se sube primero a Supabase Storage (bucket "productos") y su
 * URL pública se guarda en el campo imagen_url de la tabla.
 */
export function ProductoFormDialog({
  abierto,
  onCambiar,
  producto,
  categorias,
  onGuardado,
}: {
  abierto: boolean;
  onCambiar: (abierto: boolean) => void;
  producto: Producto | null; // null = nuevo
  categorias: Categoria[];
  onGuardado: (mensaje: string) => void;
}) {
  const editando = Boolean(producto);
  const [estado, accion, guardando] = useActionState<ResultadoAccion, FormData>(
    guardarProducto,
    null
  );
  const [imagenUrl, setImagenUrl] = useState(producto?.imagen_url ?? "");
  const [tipo, setTipo] = useState<Producto["tipo"]>(producto?.tipo ?? "Producto");
  const [subiendo, setSubiendo] = useState(false);
  const [errorImagen, setErrorImagen] = useState<string | null>(null);
  const ultimoEstado = useRef<ResultadoAccion>(null);

  // Al guardar con éxito: cerrar el diálogo y avisar al panel.
  useEffect(() => {
    if (estado && estado !== ultimoEstado.current) {
      ultimoEstado.current = estado;
      if (estado.ok) {
        onGuardado(estado.mensaje);
        onCambiar(false);
      }
    }
  }, [estado, onGuardado, onCambiar]);

  async function subirImagen(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    setErrorImagen(null);
    if (!archivo.type.startsWith("image/")) {
      setErrorImagen("El archivo debe ser una imagen (JPG, PNG o WEBP).");
      return;
    }
    if (archivo.size > 5 * 1024 * 1024) {
      setErrorImagen("La imagen pesa más de 5 MB.");
      return;
    }
    setSubiendo(true);
    const supabase = createClient();
    const extension = archivo.name.split(".").pop()?.toLowerCase() || "jpg";
    const ruta = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
    const { error } = await supabase.storage
      .from("productos")
      .upload(ruta, archivo, { contentType: archivo.type, upsert: false });
    setSubiendo(false);
    if (error) {
      setErrorImagen(`No se pudo subir la imagen: ${error.message}`);
      return;
    }
    const { data } = supabase.storage.from("productos").getPublicUrl(ruta);
    setImagenUrl(data.publicUrl);
  }

  const errorServidor = estado && !estado.ok ? estado.mensaje : null;

  return (
    <Dialog open={abierto} onOpenChange={onCambiar}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg">
            {editando ? `Editar ${producto?.codigo}` : "Registrar producto o servicio"}
          </DialogTitle>
          <DialogDescription>
            {editando
              ? "Modifica los datos y guarda los cambios."
              : "Completa los datos. El código se genera solo si lo dejas vacío."}
          </DialogDescription>
        </DialogHeader>

        <form
          // onSubmit + startTransition (en vez de action=) para que el
          // formulario NO se borre si el servidor devuelve un error.
          onSubmit={(e) => {
            e.preventDefault();
            const datos = new FormData(e.currentTarget);
            startTransition(() => accion(datos));
          }}
          className="grid gap-4 sm:grid-cols-[200px_1fr]"
        >
          <input type="hidden" name="id" value={producto?.id ?? ""} />
          <input type="hidden" name="imagen_url" value={imagenUrl} />

          {/* Imagen */}
          <div className="flex flex-col gap-2">
            <Label>Imagen *</Label>
            <label className="group relative flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed bg-muted/40 text-center text-xs text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5">
              {imagenUrl ? (
                <>
                  <Image
                    src={imagenUrl}
                    alt="Vista previa"
                    fill
                    sizes="200px"
                    unoptimized={/^https?:\/\//.test(imagenUrl)}
                    className="object-cover"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-black/55 py-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    Cambiar imagen
                  </span>
                </>
              ) : (
                <>
                  <ImagePlus className="size-8" />
                  <span>
                    Haz clic para subir
                    <br />
                    JPG, PNG o WEBP · máx. 5 MB
                  </span>
                </>
              )}
              {subiendo && (
                <span className="absolute inset-0 flex items-center justify-center gap-2 bg-background/80 text-sm text-foreground">
                  <UploadCloud className="size-4 animate-bounce" /> Subiendo…
                </span>
              )}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={subirImagen}
                aria-label="Subir imagen"
              />
            </label>
            {errorImagen && <p className="text-xs text-destructive">{errorImagen}</p>}
          </div>

          {/* Datos */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo etiqueta="Nombre *" className="sm:col-span-2">
              <Input name="nombre" required maxLength={120} defaultValue={producto?.nombre} placeholder="Ej. Ropero 3 puertas" />
            </Campo>

            <Campo etiqueta="Tipo *">
              <select
                name="tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as Producto["tipo"])}
                className={claseCampo}
              >
                <option value="Producto">Producto</option>
                <option value="Servicio">Servicio</option>
              </select>
            </Campo>

            <Campo etiqueta="Código">
              <Input
                name="codigo"
                maxLength={10}
                defaultValue={producto?.codigo}
                placeholder={tipo === "Servicio" ? "Automático (SRV-…)" : "Automático (PRD-…)"}
                className="font-mono uppercase placeholder:font-sans placeholder:normal-case"
              />
            </Campo>

            <Campo etiqueta="Categoría *">
              <select
                name="categoria_id"
                required
                defaultValue={producto?.categoria_id ?? ""}
                className={claseCampo}
              >
                <option value="" disabled>
                  Elegir…
                </option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </Campo>

            <Campo etiqueta="Marca *">
              <Input name="marca" required maxLength={60} defaultValue={producto?.marca} placeholder="Pelikano, Vesto, M&M…" list="marcas" />
              <datalist id="marcas">
                {["Pelikano", "Vesto", "Tableros Hispanos", "Paneles Andinos", "M&M", "Genérico"].map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </Campo>

            <Campo etiqueta="Precio (S/) *">
              <Input name="precio" type="number" required min={0} step="0.01" defaultValue={producto?.precio} placeholder="0.00" />
            </Campo>

            <Campo etiqueta={tipo === "Servicio" ? "Duración" : "Duración / entrega (opcional)"}>
              <Input
                name="duracion"
                maxLength={60}
                defaultValue={producto?.duracion ?? ""}
                placeholder={tipo === "Servicio" ? "Ej. 1 a 2 días" : "Ej. Entrega en 7 días"}
              />
            </Campo>

            <Campo etiqueta="Descripción *" className="sm:col-span-2">
              <textarea
                name="descripcion"
                required
                rows={3}
                defaultValue={producto?.descripcion}
                placeholder="Medidas, colores, materiales…"
                className={claseCampo + " resize-y"}
              />
            </Campo>
          </div>

          {errorServidor && (
            <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive sm:col-span-2">
              {errorServidor}
            </p>
          )}

          <div className="flex justify-end gap-2 border-t pt-4 sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onCambiar(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando || subiendo}>
              {guardando ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {editando ? "Guardar cambios" : "Registrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Campo({
  etiqueta,
  className,
  children,
}: {
  etiqueta: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={"flex flex-col gap-1.5 " + (className ?? "")}>
      <Label>{etiqueta}</Label>
      {children}
    </div>
  );
}
