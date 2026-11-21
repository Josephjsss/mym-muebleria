"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { GraficoReporte } from "@/components/admin/grafico-reporte";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { svgComoPng } from "@/lib/descargas";
import { exportarExcel, exportarPDF, exportarWord, type ImagenGrafico } from "@/lib/exportar-reportes";
import { formatoValor, type Indicadores, type Reporte } from "@/lib/reportes";
import { numeroBoleta, soles, type Pedido } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  BadgePercent,
  Banknote,
  FileSpreadsheet,
  FileText,
  FileType2,
  Lightbulb,
  Loader2,
  Package,
  Receipt,
  ShoppingBag,
  Table2,
} from "lucide-react";

type Formato = "word" | "excel" | "pdf";

export function ReportesPanel({
  reportes,
  indicadores,
  periodo,
  meses,
  periodos,
  recientes,
  generadoPor,
  errorBD,
}: {
  reportes: Reporte[];
  indicadores: Indicadores;
  periodo: string;
  meses: number;
  periodos: number[];
  recientes: Pedido[];
  generadoPor: string;
  errorBD: string | null;
}) {
  const graficos = useRef<Record<string, HTMLDivElement | null>>({});
  const [exportando, setExportando] = useState<Formato | null>(null);
  const [errorExportar, setErrorExportar] = useState<string | null>(null);

  async function exportar(formato: Formato) {
    setExportando(formato);
    setErrorExportar(null);
    try {
      // Cada gráfico (SVG) se convierte en imagen PNG para insertarlo en el informe.
      const imagenes: Record<string, ImagenGrafico> = {};
      for (const r of reportes) {
        const nodo = graficos.current[r.id];
        imagenes[r.id] = nodo ? await svgComoPng(nodo) : null;
      }
      const informe = { reportes, indicadores, periodo, generadoPor, imagenes };
      if (formato === "word") await exportarWord(informe);
      else if (formato === "excel") await exportarExcel(informe);
      else await exportarPDF(informe);
    } catch (e) {
      setErrorExportar(`No se pudo generar el informe: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setExportando(null);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      {/* Título + filtros + descargas en una fila */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Reportes</h1>
          <p className="text-sm text-muted-foreground">
            Ventas de la tienda en línea · <span className="font-medium text-foreground">{periodo}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg bg-muted p-1" role="group" aria-label="Periodo">
            {periodos.map((p) => (
              <Link
                key={p}
                href={`/admin/reportes?meses=${p}`}
                aria-current={p === meses ? "true" : undefined}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
                  p === meses ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {p} meses
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Descargar informe:</span>
            <BotonDescarga formato="word" etiqueta="Word" icono={FileText} exportando={exportando} onClick={exportar} />
            <BotonDescarga formato="excel" etiqueta="Excel" icono={FileSpreadsheet} exportando={exportando} onClick={exportar} />
            <BotonDescarga formato="pdf" etiqueta="PDF" icono={FileType2} exportando={exportando} onClick={exportar} />
          </div>
        </div>
      </div>

      {(errorBD || errorExportar) && (
        <p role="alert" className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {errorBD
            ? /does not exist|could not find/i.test(errorBD)
              ? "Falta preparar la base de datos: ejecuta supabase/mym_muebleria.sql en Supabase."
              : `Error de base de datos: ${errorBD}`
            : errorExportar}
        </p>
      )}

      {/* Indicadores */}
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Indicador icono={Banknote} etiqueta="Ventas totales" valor={soles(indicadores.ventas)} />
        <Indicador icono={ShoppingBag} etiqueta="Pedidos" valor={String(indicadores.pedidos)} />
        <Indicador icono={Receipt} etiqueta="Ticket promedio" valor={soles(indicadores.ticketPromedio)} />
        <Indicador icono={BadgePercent} etiqueta="Ahorro por ofertas" valor={soles(indicadores.ahorro)} />
      </div>

      {/* Los 6 reportes */}
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {reportes.map((r) => (
          <section key={r.id} className="flex flex-col rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Reporte {r.numero}</p>
                <h2 className="font-heading text-base font-semibold">{r.titulo}</h2>
                <p className="text-xs text-muted-foreground">{r.subtitulo}</p>
              </div>
            </div>

            <div
              className="mt-3"
              ref={(nodo) => {
                graficos.current[r.id] = nodo;
              }}
            >
              <GraficoReporte reporte={r} />
            </div>

            <div className="mt-3 rounded-lg bg-primary/5 p-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <Lightbulb className="size-3.5" />
                Descripción del resultado
              </p>
              <p className="mt-1 text-sm leading-relaxed text-foreground/85">{r.conclusion}</p>
            </div>

            {/* Vista de tabla (accesible y para revisar los números exactos) */}
            <details className="group mt-2 text-sm">
              <summary className="flex cursor-pointer list-none items-center gap-1.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground">
                <Table2 className="size-3.5" />
                <span className="group-open:hidden">Ver tabla de datos</span>
                <span className="hidden group-open:inline">Ocultar tabla</span>
              </summary>
              <table className="mt-1 w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="py-1.5 font-medium">{r.columnas[0]}</th>
                    <th className="py-1.5 text-right font-medium">{r.columnas[1]}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {r.datos.map((d) => (
                    <tr key={d.etiqueta}>
                      <td className="py-1.5">{d.etiqueta}</td>
                      <td className="py-1.5 text-right tabular-nums">{formatoValor(d.valor, r.unidad)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </section>
        ))}
      </div>

      {/* Últimas ventas */}
      <section className="mt-5 overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <Package className="size-4 text-primary" />
          <h2 className="font-heading text-sm font-semibold">Últimas ventas</h2>
        </div>
        {recientes.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">Aún no hay ventas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 font-medium">Boleta</th>
                  <th className="px-3 py-2 font-medium">Cliente</th>
                  <th className="px-3 py-2 font-medium">Fecha</th>
                  <th className="px-3 py-2 font-medium">Estado</th>
                  <th className="px-4 py-2 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recientes.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/40">
                    <td className="px-4 py-2">
                      <Link href={`/pedidos/${p.id}`} className="font-mono text-xs font-semibold text-primary hover:underline">
                        {numeroBoleta(p)}
                      </Link>
                      {p.es_demo && <span className="ml-1.5 text-[10px] text-muted-foreground">demo</span>}
                    </td>
                    <td className="px-3 py-2">{p.cliente_nombre}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {new Date(p.creado_en).toLocaleDateString("es-PE", { timeZone: "America/Lima", dateStyle: "medium" })}
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant={p.estado === "Anulado" ? "destructive" : p.estado === "Entregado" ? "secondary" : "outline"}>
                        {p.estado}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-right font-medium tabular-nums">{soles(p.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function BotonDescarga({
  formato,
  etiqueta,
  icono: Icono,
  exportando,
  onClick,
}: {
  formato: Formato;
  etiqueta: string;
  icono: typeof FileText;
  exportando: Formato | null;
  onClick: (f: Formato) => void;
}) {
  return (
    <Button size="sm" variant="outline" disabled={exportando !== null} onClick={() => onClick(formato)}>
      {exportando === formato ? <Loader2 className="size-3.5 animate-spin" /> : <Icono className="size-3.5" />}
      {etiqueta}
    </Button>
  );
}

function Indicador({ icono: Icono, etiqueta, valor }: { icono: typeof Banknote; etiqueta: string; valor: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icono className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate font-heading text-xl font-bold leading-none tabular-nums">{valor}</p>
        <p className="mt-1 text-xs text-muted-foreground">{etiqueta}</p>
      </div>
    </div>
  );
}
