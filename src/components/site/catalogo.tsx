"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ProductCard } from "@/components/site/product-card";
import {
  PRODUCTO_SELECT,
  limpiarTermino,
  type Categoria,
  type Producto,
} from "@/lib/types";
import { Search, X, Loader2, PackageSearch } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * BÚSQUEDA DINÁMICA del catálogo.
 * Mientras el usuario escribe (sin botón y sin recargar la página) se
 * consulta la base de datos con un filtro ILIKE y se repinta la lista.
 */
export function Catalogo({
  productosIniciales,
  categorias,
  categoriaInicial = null,
}: {
  productosIniciales: Producto[];
  categorias: Categoria[];
  categoriaInicial?: number | null;
}) {
  const [productos, setProductos] = useState(productosIniciales);
  const [texto, setTexto] = useState("");
  const [categoriaId, setCategoriaId] = useState<number | null>(categoriaInicial);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const primeraVez = useRef(true);

  useEffect(() => {
    // La primera carga ya viene del servidor.
    if (primeraVez.current) {
      primeraVez.current = false;
      return;
    }

    let cancelado = false;
    // Espera 250 ms después de la última tecla para no consultar en cada letra.
    const temporizador = setTimeout(async () => {
      setCargando(true);
      const supabase = createClient();
      let consulta = supabase.from("productos").select(PRODUCTO_SELECT).order("codigo");

      const termino = limpiarTermino(texto);
      if (termino) {
        consulta = consulta.or(
          `nombre.ilike.%${termino}%,descripcion.ilike.%${termino}%,marca.ilike.%${termino}%,codigo.ilike.%${termino}%`
        );
      }
      if (categoriaId) consulta = consulta.eq("categoria_id", categoriaId);

      const { data, error } = await consulta;
      if (cancelado) return;
      setCargando(false);
      if (error) {
        setError("No se pudo consultar la base de datos.");
        return;
      }
      setError(null);
      setProductos((data ?? []) as Producto[]);
    }, 250);

    return () => {
      cancelado = true;
      clearTimeout(temporizador);
    };
  }, [texto, categoriaId]);

  return (
    <div>
      <div className="sticky top-16 z-30 -mx-4 border-b bg-background/85 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Busca por nombre, marca, código o descripción… (ej. ropero, Pelikano, SRV)"
            aria-label="Buscar productos"
            className="h-12 w-full rounded-xl border border-input bg-card pl-11 pr-11 text-base shadow-sm outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/20 [&::-webkit-search-cancel-button]:hidden"
          />
          {cargando ? (
            <Loader2 className="absolute right-3.5 top-1/2 size-5 -translate-y-1/2 animate-spin text-primary" />
          ) : (
            texto && (
              <button
                type="button"
                onClick={() => setTexto("")}
                className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                aria-label="Limpiar búsqueda"
              >
                <X className="size-4" />
              </button>
            )
          )}
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          <Chip activo={categoriaId === null} onClick={() => setCategoriaId(null)}>
            Todos
          </Chip>
          {categorias.map((c) => (
            <Chip
              key={c.id}
              activo={categoriaId === c.id}
              onClick={() => setCategoriaId(categoriaId === c.id ? null : c.id)}
            >
              {c.nombre}
            </Chip>
          ))}
        </div>
      </div>

      <p className="mt-5 text-sm text-muted-foreground" aria-live="polite">
        {error ? (
          <span className="text-destructive">{error}</span>
        ) : (
          <>
            <span className="font-semibold text-foreground">{productos.length}</span>{" "}
            {productos.length === 1 ? "resultado" : "resultados"}
            {texto && (
              <>
                {" "}para «<span className="text-foreground">{texto}</span>»
              </>
            )}
          </>
        )}
      </p>

      {productos.length === 0 && !cargando ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-dashed py-16 text-center">
          <PackageSearch className="size-10 text-muted-foreground" />
          <p className="font-medium">No encontramos productos con esa búsqueda</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Prueba con otra palabra o escríbenos por WhatsApp: también fabricamos a medida.
          </p>
        </div>
      ) : (
        <div
          className={cn(
            "mt-4 grid gap-5 transition-opacity sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
            cargando && "opacity-60"
          )}
        >
          {productos.map((p) => (
            <ProductCard key={p.id} producto={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        activo
          ? "border-primary bg-primary text-primary-foreground"
          : "bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
