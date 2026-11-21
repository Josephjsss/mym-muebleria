"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type PropsGlobo = {
  active?: boolean;
  label?: unknown;
  payload?: readonly { value?: unknown; payload?: { etiqueta?: string } }[];
};
import { formatoValor, type Reporte } from "@/lib/reportes";

// Colores en HEX (no variables CSS): el SVG se exporta como imagen al
// informe Word/Excel/PDF y ahí no existen las variables del sitio.
const COLOR_BARRA = "#0d9488"; // teal de la marca (validado: contraste ≥ 3:1 sobre blanco)
const COLOR_TEXTO = "#5b6b6a";
const COLOR_REJILLA = "#e6ebea";

function abreviar(valor: number, unidad: Reporte["unidad"]) {
  if (unidad !== "soles") return String(valor);
  if (valor >= 1000) return `S/ ${(valor / 1000).toLocaleString("es-PE", { maximumFractionDigits: 1 })} mil`;
  return `S/ ${valor}`;
}

function recortar(texto: string, max = 24) {
  return texto.length > max ? texto.slice(0, max - 1) + "…" : texto;
}

/** Gráfico de una sola serie: columnas (meses, días) o barras horizontales (rankings). */
export function GraficoReporte({ reporte }: { reporte: Reporte }) {
  const horizontal = reporte.forma === "barras";
  const alto = horizontal ? Math.max(180, reporte.datos.length * 40 + 30) : 260;

  if (reporte.datos.length === 0 || reporte.datos.every((d) => d.valor === 0)) {
    return (
      <div
        style={{ height: 200 }}
        className="flex items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground"
      >
        Sin datos en el periodo
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={alto}>
      <BarChart
        data={reporte.datos}
        layout={horizontal ? "vertical" : "horizontal"}
        margin={horizontal ? { top: 4, right: 72, bottom: 4, left: 4 } : { top: 12, right: 8, bottom: 4, left: 4 }}
        barCategoryGap={horizontal ? 10 : "22%"}
        accessibilityLayer
      >
        <CartesianGrid stroke={COLOR_REJILLA} vertical={horizontal} horizontal={!horizontal} />
        {horizontal ? (
          <>
            <XAxis type="number" hide domain={[0, "dataMax"]} />
            <YAxis
              type="category"
              dataKey="etiqueta"
              width={170}
              tickLine={false}
              axisLine={false}
              tick={{ fill: COLOR_TEXTO, fontSize: 12 }}
              tickFormatter={(t: string) => recortar(t)}
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey="etiqueta"
              tickLine={false}
              axisLine={{ stroke: COLOR_REJILLA }}
              tick={{ fill: COLOR_TEXTO, fontSize: 12 }}
              interval={0}
              tickFormatter={(t: string) => (reporte.datos.length > 7 ? t.slice(0, 3) : t)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={reporte.unidad === "soles" ? 72 : 36}
              allowDecimals={false}
              tick={{ fill: COLOR_TEXTO, fontSize: 12 }}
              tickFormatter={(v: number) => abreviar(v, reporte.unidad)}
            />
          </>
        )}
        <Tooltip
          cursor={{ fill: "#0d948814" }}
          isAnimationActive={false}
          content={({ active, label, payload }) => (
            <Globo active={active} label={label} payload={payload} unidad={reporte.unidad} />
          )}
        />
        <Bar
          dataKey="valor"
          name={reporte.columnas[1]}
          fill={COLOR_BARRA}
          maxBarSize={horizontal ? 24 : 44}
          radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
          isAnimationActive={false}
        >
          {/* Rankings: valor al final de cada barra (se lee también en el informe impreso). */}
          {horizontal && (
            <LabelList
              dataKey="valor"
              position="right"
              fill={COLOR_TEXTO}
              fontSize={12}
              formatter={(v) => formatoValor(Number(v), reporte.unidad)}
            />
          )}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function Globo({
  active,
  payload,
  label,
  unidad,
}: PropsGlobo & { unidad: Reporte["unidad"] }) {
  if (!active || !payload?.length) return null;
  const dato = payload[0];
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-foreground">{String(label ?? dato.payload?.etiqueta ?? "")}</p>
      <p className="mt-0.5 flex items-center gap-1.5 text-muted-foreground">
        <span className="size-2 rounded-sm" style={{ background: COLOR_BARRA }} />
        <span className="tabular-nums text-foreground">{formatoValor(Number(dato.value), unidad)}</span>
      </p>
    </div>
  );
}
