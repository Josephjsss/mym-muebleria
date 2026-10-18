"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { eliminarProducto } from "@/app/admin/actions";
import { ProductoFormDialog } from "@/components/admin/producto-form";
import { ProductImage } from "@/components/site/product-image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CAMPOS_BUSQUEDA,
  PRODUCTO_SELECT,
  formatoPrecio,
  limpiarTermino,
  type CampoBusqueda,
  type Categoria,
  type Producto,
  type Usuario,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Search,
  Zap,
  LogOut,
  Store,
  Package,
  Wrench,
  Layers,
  Boxes,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

type Props = {
  usuario: Usuario;
  productos: Producto[];
  categorias: Categoria[];
  resumen: { total: number; productos: number; servicios: number; categorias: number };
  busquedaEstatica: { q: string; campo: CampoBusqueda };
  errorBD: string | null;
};

export function AdminPanel({
  usuario,
  productos,
  categorias,
  resumen,
  busquedaEstatica,
  errorBD,
}: Props) {
  const router = useRouter();
  const [aviso, setAviso] = useState<{ ok: boolean; mensaje: string } | null>(null);

  // Formulario crear / editar
  const [formAbierto, setFormAbierto] = useState(false);
  const [enEdicion, setEnEdicion] = useState<Producto | null>(null);
  const [claveForm, setClaveForm] = useState(0);

  // Confirmación de eliminar
  const [porEliminar, setPorEliminar] = useState<Producto | null>(null);
  const [eliminando, iniciarEliminar] = useTransition();

  // BÚSQUEDA DINÁMICA: consulta la BD mientras se escribe.
  const [textoDinamico, setTextoDinamico] = useState("");
  const [resultadosDinamicos, setResultadosDinamicos] = useState<Producto[] | null>(null);
  const [buscando, setBuscando] = useState(false);

  useEffect(() => {
    const termino = limpiarTermino(textoDinamico);
    if (!termino) return;
    let cancelado = false;
    const t = setTimeout(async () => {
      setBuscando(true);
      const { data } = await createClient()
        .from("productos")
        .select(PRODUCTO_SELECT)
        .or(
          `nombre.ilike.%${termino}%,codigo.ilike.%${termino}%,marca.ilike.%${termino}%,descripcion.ilike.%${termino}%`
        )
        .order("codigo");
      if (cancelado) return;
      setBuscando(false);
      setResultadosDinamicos((data ?? []) as Producto[]);
    }, 250);
    return () => {
      cancelado = true;
      clearTimeout(t);
    };
  }, [textoDinamico, productos]);

  // Si hay texto en la búsqueda dinámica se muestran sus resultados;
  // si no, la lista que mandó el servidor (completa o con búsqueda estática).
  const dinamicaActiva = Boolean(limpiarTermino(textoDinamico)) && resultadosDinamicos !== null;
  const lista = dinamicaActiva ? resultadosDinamicos! : productos;
  const filtroEstaticoActivo = Boolean(busquedaEstatica.q);

  const abrirNuevo = () => {
    setEnEdicion(null);
    setClaveForm((k) => k + 1);
    setFormAbierto(true);
  };
  const abrirEditar = (p: Producto) => {
    setEnEdicion(p);
    setClaveForm((k) => k + 1);
    setFormAbierto(true);
  };
  const alGuardar = useCallback(
    (mensaje: string) => {
      setAviso({ ok: true, mensaje });
      router.refresh();
    },
    [router]
  );

  function confirmarEliminar() {
    if (!porEliminar) return;
    const id = porEliminar.id;
    iniciarEliminar(async () => {
      const r = await eliminarProducto(id);
      setAviso(r);
      setPorEliminar(null);
      router.refresh();
    });
  }

  async function cerrarSesion() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-full flex-1 bg-muted/40">
      {/* Barra superior */}
      <header className="sticky top-0 z-40 border-b bg-[#0f2a27] text-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-3">
            <span className="relative flex size-9 items-center justify-center overflow-hidden rounded-md bg-white">
              <Image src="/images/logo-mark.png" alt="Logo M&M" fill sizes="36px" className="object-contain p-1" />
            </span>
            <div className="leading-tight">
              <p className="font-heading text-sm font-semibold">Panel de administración</p>
              <p className="text-xs text-white/60">M&M Mueblería · Gestión de productos</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-right text-xs leading-tight sm:block">
              <span className="block font-medium">{usuario.nombre}</span>
              <span className="text-white/60">{usuario.correo} · {usuario.rol}</span>
            </span>
            <Button size="sm" variant="ghost" nativeButton={false} className="text-white hover:bg-white/10 hover:text-white" render={<Link href="/" />}>
              <Store className="size-3.5" />
              <span className="hidden sm:inline">Ver web</span>
            </Button>
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 hover:text-white" onClick={cerrarSesion}>
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Resumen */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Indicador icono={Boxes} etiqueta="Registros en la BD" valor={resumen.total} />
          <Indicador icono={Package} etiqueta="Productos" valor={resumen.productos} />
          <Indicador icono={Wrench} etiqueta="Servicios" valor={resumen.servicios} />
          <Indicador icono={Layers} etiqueta="Categorías" valor={resumen.categorias} />
        </div>

        {/* Búsquedas */}
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {/* ESTÁTICA */}
          <section className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                <Search className="size-4" />
              </span>
              <h2 className="font-heading text-sm font-semibold">Búsqueda estática</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Eliges el campo, escribes y pulsas <b>Buscar</b>: se envía el formulario
              y el servidor devuelve la página filtrada.
            </p>
            <form method="get" action="/admin" className="mt-3 flex flex-col gap-2 sm:flex-row">
              <select
                name="campo"
                defaultValue={busquedaEstatica.campo}
                aria-label="Campo de búsqueda"
                className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {Object.entries(CAMPOS_BUSQUEDA).map(([valor, etiqueta]) => (
                  <option key={valor} value={valor}>
                    {etiqueta}
                  </option>
                ))}
              </select>
              <input
                name="q"
                defaultValue={busquedaEstatica.q}
                placeholder="Ej. Pelikano"
                aria-label="Texto a buscar"
                className="h-9 flex-1 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
              <div className="flex gap-2">
                <Button type="submit" className="h-9 flex-1 sm:flex-none">
                  <Search className="size-4" />
                  Buscar
                </Button>
                {filtroEstaticoActivo && (
                  <Button variant="outline" className="h-9" nativeButton={false} render={<Link href="/admin" />}>
                    Limpiar
                  </Button>
                )}
              </div>
            </form>
          </section>

          {/* DINÁMICA */}
          <section className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-md bg-primary/15 text-primary">
                <Zap className="size-4" />
              </span>
              <h2 className="font-heading text-sm font-semibold">Búsqueda dinámica</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Los resultados se actualizan <b>mientras escribes</b>, sin botón ni recargar.
              Busca en nombre, código, marca y descripción a la vez.
            </p>
            <div className="relative mt-3">
              <Zap className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-primary" />
              <input
                value={textoDinamico}
                onChange={(e) => setTextoDinamico(e.target.value)}
                placeholder="Empieza a escribir… (ej. cocina)"
                aria-label="Búsqueda dinámica"
                className="h-9 w-full rounded-lg border border-input bg-transparent pl-8 pr-9 text-sm outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/25"
              />
              {buscando ? (
                <Loader2 className="absolute right-2.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-primary" />
              ) : (
                textoDinamico && (
                  <button
                    type="button"
                    onClick={() => setTextoDinamico("")}
                    aria-label="Limpiar búsqueda dinámica"
                    className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                  >
                    <X className="size-3.5" />
                  </button>
                )
              )}
            </div>
          </section>
        </div>

        {/* Aviso de operación */}
        {aviso && (
          <div
            role="status"
            className={cn(
              "mt-5 flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm",
              aviso.ok
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-destructive/30 bg-destructive/10 text-destructive"
            )}
          >
            {aviso.ok ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}
            <span className="flex-1">{aviso.mensaje}</span>
            <button type="button" onClick={() => setAviso(null)} aria-label="Cerrar aviso">
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* Tabla CRUD */}
        <section className="mt-5 overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
            <div>
              <h2 className="font-heading text-base font-semibold">Productos y servicios</h2>
              <p className="text-xs text-muted-foreground">
                {dinamicaActiva
                  ? `${lista.length} resultado(s) de la búsqueda dinámica «${textoDinamico}»`
                  : filtroEstaticoActivo
                    ? `${lista.length} resultado(s) de la búsqueda estática: ${CAMPOS_BUSQUEDA[busquedaEstatica.campo]} contiene «${busquedaEstatica.q}»`
                    : `${lista.length} registros`}
              </p>
            </div>
            <Button onClick={abrirNuevo}>
              <Plus className="size-4" />
              Nuevo producto
            </Button>
          </div>

          {errorBD ? (
            <p className="p-6 text-sm text-destructive">Error de base de datos: {errorBD}</p>
          ) : lista.length === 0 ? (
            <p className="p-10 text-center text-sm text-muted-foreground">
              No hay productos que coincidan con la búsqueda.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-sm">
                <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Imagen</th>
                    <th className="px-3 py-2.5 font-medium">Código</th>
                    <th className="px-3 py-2.5 font-medium">Nombre</th>
                    <th className="px-3 py-2.5 font-medium">Categoría</th>
                    <th className="px-3 py-2.5 font-medium">Marca</th>
                    <th className="px-3 py-2.5 font-medium">Tipo</th>
                    <th className="px-3 py-2.5 font-medium">Duración</th>
                    <th className="px-3 py-2.5 text-right font-medium">Precio</th>
                    <th className="px-4 py-2.5 text-right font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {lista.map((p) => (
                    <tr key={p.id} className="transition-colors hover:bg-muted/40">
                      <td className="px-4 py-2">
                        <div className="relative size-14 overflow-hidden rounded-lg border bg-muted">
                          <ProductImage src={p.imagen_url} alt={p.nombre} sizes="56px" />
                        </div>
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">{p.codigo}</td>
                      <td className="max-w-64 px-3 py-2">
                        <p className="font-medium">{p.nombre}</p>
                        <p className="line-clamp-1 text-xs text-muted-foreground">{p.descripcion}</p>
                      </td>
                      <td className="px-3 py-2">{p.categoria?.nombre}</td>
                      <td className="px-3 py-2">{p.marca}</td>
                      <td className="px-3 py-2">
                        <Badge variant={p.tipo === "Producto" ? "secondary" : "outline"}>{p.tipo}</Badge>
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{p.duracion ?? "—"}</td>
                      <td className="px-3 py-2 text-right font-medium tabular-nums">
                        {formatoPrecio(p.precio)}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            nativeButton={false}
                            title="Ver en la web"
                            aria-label={`Ver ${p.nombre}`}
                            render={<Link href={`/productos/${p.id}`} target="_blank" />}
                          >
                            <Eye className="size-4" />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            title="Editar"
                            aria-label={`Editar ${p.nombre}`}
                            onClick={() => abrirEditar(p)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            title="Eliminar"
                            aria-label={`Eliminar ${p.nombre}`}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setPorEliminar(p)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <ProductoFormDialog
        key={claveForm}
        abierto={formAbierto}
        onCambiar={setFormAbierto}
        producto={enEdicion}
        categorias={categorias}
        onGuardado={alGuardar}
      />

      <Dialog open={Boolean(porEliminar)} onOpenChange={(v) => !v && setPorEliminar(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>¿Eliminar este registro?</DialogTitle>
            <DialogDescription>
              Se borrará «{porEliminar?.nombre}» ({porEliminar?.codigo}) de la base de datos.
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPorEliminar(null)}>
              Cancelar
            </Button>
            <Button
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={eliminando}
              onClick={confirmarEliminar}
            >
              {eliminando ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Indicador({
  icono: Icono,
  etiqueta,
  valor,
}: {
  icono: typeof Package;
  etiqueta: string;
  valor: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm">
      <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icono className="size-5" />
      </span>
      <div>
        <p className="font-heading text-2xl font-bold leading-none">{valor}</p>
        <p className="mt-1 text-xs text-muted-foreground">{etiqueta}</p>
      </div>
    </div>
  );
}
