// Cálculo de los 6 REPORTES del sistema interno (administrador).
// Es una función pura: recibe filas de la BD y devuelve datos para el gráfico,
// la tabla y la DESCRIPCIÓN DEL RESULTADO (texto que se redacta según los datos).

import { soles } from "@/lib/types";

export type UnidadReporte = "soles" | "unidades" | "pedidos";

export type Reporte = {
  id: string;
  numero: number;
  titulo: string;
  subtitulo: string;
  forma: "columnas" | "barras"; // columnas = tiempo/orden natural; barras = ranking
  unidad: UnidadReporte;
  columnas: [string, string];
  datos: { etiqueta: string; valor: number }[];
  conclusion: string;
};

export type Indicadores = {
  ventas: number;
  pedidos: number;
  ticketPromedio: number;
  unidades: number;
  ahorro: number;
};

export type PedidoReporte = {
  creado_en: string;
  total: number;
  descuento: number;
  estado: string;
  items: { codigo: string; nombre: string; categoria: string; cantidad: number; importe: number; descuento_pct: number }[];
};

export type ProductoReporte = {
  codigo: string;
  nombre: string;
  stock: number;
  tipo: string;
  activo: boolean;
};

const ZONA = "America/Lima";
const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export function formatoValor(valor: number, unidad: UnidadReporte) {
  if (unidad === "soles") return soles(valor);
  const n = new Intl.NumberFormat("es-PE").format(valor);
  if (unidad === "pedidos") return `${n} ${valor === 1 ? "pedido" : "pedidos"}`;
  return `${n} ${valor === 1 ? "unidad" : "unidades"}`;
}

/** Clave AAAA-MM del mes de una fecha, en hora de Lima. */
function claveMes(fecha: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: ZONA, year: "numeric", month: "2-digit" })
    .format(fecha)
    .slice(0, 7);
}

/** Los últimos `meses` meses (incluido el actual), del más antiguo al más reciente. */
export function ultimosMeses(meses: number, hoy = new Date()) {
  const [anio, mes] = claveMes(hoy).split("-").map(Number);
  const lista: { clave: string; etiqueta: string }[] = [];
  for (let i = meses - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(anio, mes - 1 - i, 15));
    const clave = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    const etiqueta = d
      .toLocaleDateString("es-PE", { month: "short", year: "2-digit", timeZone: "UTC" })
      .replace(".", "");
    lista.push({ clave, etiqueta });
  }
  return lista;
}

/** Primer instante del periodo (con un día de margen por la zona horaria). */
export function inicioPeriodo(meses: number, hoy = new Date()) {
  const [anio, mes] = claveMes(hoy).split("-").map(Number);
  return new Date(Date.UTC(anio, mes - meses, 0)).toISOString();
}

function diaSemana(fecha: Date) {
  const corto = new Intl.DateTimeFormat("en-US", { timeZone: ZONA, weekday: "short" }).format(fecha);
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(corto);
}

const pct = (parte: number, total: number) => (total > 0 ? Math.round((parte / total) * 100) : 0);
const redondear = (n: number) => Math.round(n * 100) / 100;

function sumarPor<T>(lista: T[], clave: (x: T) => string, valor: (x: T) => number) {
  const mapa = new Map<string, number>();
  for (const x of lista) mapa.set(clave(x), (mapa.get(clave(x)) ?? 0) + valor(x));
  return mapa;
}

export function calcularReportes(
  pedidosTodos: PedidoReporte[],
  productos: ProductoReporte[],
  meses: number,
  hoy = new Date()
): { reportes: Reporte[]; indicadores: Indicadores; periodo: string } {
  const listaMeses = ultimosMeses(meses, hoy);
  const clavesMes = new Set(listaMeses.map((m) => m.clave));
  // Las ventas anuladas no cuentan.
  const pedidos = pedidosTodos.filter(
    (p) => p.estado !== "Anulado" && clavesMes.has(claveMes(new Date(p.creado_en)))
  );
  const items = pedidos.flatMap((p) => p.items);
  const periodo = `${listaMeses[0].etiqueta} – ${listaMeses[listaMeses.length - 1].etiqueta}`;

  const ventas = redondear(pedidos.reduce((s, p) => s + Number(p.total), 0));
  const unidades = items.reduce((s, i) => s + i.cantidad, 0);
  const ahorro = redondear(pedidos.reduce((s, p) => s + Number(p.descuento), 0));
  const indicadores: Indicadores = {
    ventas,
    pedidos: pedidos.length,
    ticketPromedio: pedidos.length ? redondear(ventas / pedidos.length) : 0,
    unidades,
    ahorro,
  };
  const sinVentas = "No hay ventas registradas en el periodo; el reporte se completará cuando existan pedidos.";

  // 1. VENTAS POR MES
  const porMes = sumarPor(pedidos, (p) => claveMes(new Date(p.creado_en)), (p) => Number(p.total));
  const datosMes = listaMeses.map((m) => ({ etiqueta: m.etiqueta, valor: redondear(porMes.get(m.clave) ?? 0) }));
  let conclusionMes = sinVentas;
  if (ventas > 0) {
    const mejor = datosMes.reduce((a, b) => (b.valor > a.valor ? b : a));
    const ultimo = datosMes[datosMes.length - 1];
    const penultimo = datosMes[datosMes.length - 2];
    const promedio = ventas / datosMes.length;
    conclusionMes =
      `En el periodo se vendió ${soles(ventas)}, un promedio de ${soles(promedio)} por mes. ` +
      `El mejor mes fue ${mejor.etiqueta} con ${soles(mejor.valor)}. `;
    if (penultimo && penultimo.valor > 0) {
      const variacion = Math.round(((ultimo.valor - penultimo.valor) / penultimo.valor) * 100);
      conclusionMes +=
        variacion >= 0
          ? `El mes actual (${ultimo.etiqueta}, aún en curso) va ${variacion} % por encima del anterior.`
          : `El mes actual (${ultimo.etiqueta}, aún en curso) va ${Math.abs(variacion)} % por debajo del anterior; conviene reforzar la difusión de ofertas.`;
    }
  }

  // 2. TOP 5 PRODUCTOS MÁS VENDIDOS (unidades)
  const porProducto = sumarPor(items, (i) => i.nombre, (i) => i.cantidad);
  const top = [...porProducto.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([etiqueta, valor]) => ({ etiqueta, valor }));
  const unidadesTop = top.reduce((s, t) => s + t.valor, 0);
  const conclusionTop = top.length
    ? `«${top[0].etiqueta}» es el producto más vendido con ${formatoValor(top[0].valor, "unidades")}. ` +
      `Los ${top.length} primeros concentran el ${pct(unidadesTop, unidades)} % de las ${formatoValor(unidades, "unidades")} vendidas, ` +
      `por lo que conviene asegurar su stock y materiales.`
    : sinVentas;

  // 3. VENTAS POR CATEGORÍA (S/)
  const porCategoria = sumarPor(items, (i) => i.categoria, (i) => Number(i.importe));
  const datosCategoria = [...porCategoria.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([etiqueta, valor]) => ({ etiqueta, valor: redondear(valor) }));
  const conclusionCategoria = datosCategoria.length
    ? `${datosCategoria[0].etiqueta} lidera con ${soles(datosCategoria[0].valor)} (${pct(datosCategoria[0].valor, ventas)} % de los ingresos)` +
      (datosCategoria.length > 1
        ? `, seguida de ${datosCategoria[1].etiqueta} (${pct(datosCategoria[1].valor, ventas)} %).` +
          (datosCategoria.length > 2
            ? ` La categoría con menos ingresos es ${datosCategoria[datosCategoria.length - 1].etiqueta}: es candidata para una oferta.`
            : "")
        : ".")
    : sinVentas;

  // 4. PEDIDOS POR DÍA DE LA SEMANA
  const conteoDias = Array(7).fill(0) as number[];
  for (const p of pedidos) {
    const d = diaSemana(new Date(p.creado_en));
    if (d >= 0) conteoDias[d]++;
  }
  const datosDias = DIAS.map((etiqueta, i) => ({ etiqueta, valor: conteoDias[i] }));
  let conclusionDias = sinVentas;
  if (pedidos.length) {
    const max = datosDias.reduce((a, b) => (b.valor > a.valor ? b : a));
    const min = datosDias.reduce((a, b) => (b.valor < a.valor ? b : a));
    conclusionDias =
      `El ${max.etiqueta.toLowerCase()} es el día con más pedidos (${max.valor}) y el ${min.etiqueta.toLowerCase()} el más bajo (${min.valor}). ` +
      `Se recomienda reforzar la atención por WhatsApp el ${max.etiqueta.toLowerCase()} y lanzar promociones el ${min.etiqueta.toLowerCase()}.`;
  }

  // 5. AHORRO ENTREGADO POR OFERTAS (S/ por mes)
  const ahorroMes = sumarPor(pedidos, (p) => claveMes(new Date(p.creado_en)), (p) => Number(p.descuento));
  const datosAhorro = listaMeses.map((m) => ({ etiqueta: m.etiqueta, valor: redondear(ahorroMes.get(m.clave) ?? 0) }));
  const unidadesOferta = items.filter((i) => i.descuento_pct > 0).reduce((s, i) => s + i.cantidad, 0);
  const conclusionAhorro = pedidos.length
    ? `Las ofertas (mínimo 5 %) ahorraron ${soles(ahorro)} a los clientes en el periodo. ` +
      `El ${pct(unidadesOferta, unidades)} % de las unidades vendidas tenía descuento` +
      (ventas > 0 ? `, y el descuento equivale al ${((ahorro / (ventas + ahorro)) * 100).toFixed(1)} % del precio de lista.` : ".")
    : sinVentas;

  // 6. PRODUCTOS CON MENOR STOCK (situación actual)
  const conStock = productos.filter((p) => p.activo && p.tipo === "Producto");
  const datosStock = [...conStock]
    .sort((a, b) => a.stock - b.stock || a.nombre.localeCompare(b.nombre))
    .slice(0, 8)
    .map((p) => ({ etiqueta: p.nombre, valor: p.stock }));
  const agotados = conStock.filter((p) => p.stock === 0).length;
  const criticos = conStock.filter((p) => p.stock > 0 && p.stock <= 3).length;
  const conclusionStock = conStock.length
    ? `De ${conStock.length} productos a la venta, ${agotados} ${agotados === 1 ? "está agotado" : "están agotados"} y ` +
      `${criticos} ${criticos === 1 ? "tiene" : "tienen"} 3 unidades o menos. ` +
      (agotados + criticos > 0
        ? `Se recomienda reponer primero «${datosStock[0].etiqueta}».`
        : "El inventario está en un nivel saludable.")
    : "No hay productos activos con stock.";

  const reportes: Reporte[] = [
    {
      id: "ventas-mes",
      numero: 1,
      titulo: "Ventas por mes",
      subtitulo: "Ingresos totales (IGV incluido) de cada mes",
      forma: "columnas",
      unidad: "soles",
      columnas: ["Mes", "Ventas (S/)"],
      datos: datosMes,
      conclusion: conclusionMes,
    },
    {
      id: "top-productos",
      numero: 2,
      titulo: "Productos más vendidos",
      subtitulo: "Top 5 por unidades vendidas",
      forma: "barras",
      unidad: "unidades",
      columnas: ["Producto", "Unidades"],
      datos: top,
      conclusion: conclusionTop,
    },
    {
      id: "ventas-categoria",
      numero: 3,
      titulo: "Ventas por categoría",
      subtitulo: "Ingresos de cada categoría de muebles",
      forma: "barras",
      unidad: "soles",
      columnas: ["Categoría", "Ventas (S/)"],
      datos: datosCategoria,
      conclusion: conclusionCategoria,
    },
    {
      id: "pedidos-dia",
      numero: 4,
      titulo: "Pedidos por día de la semana",
      subtitulo: "Cantidad de pedidos según el día en que se hicieron",
      forma: "columnas",
      unidad: "pedidos",
      columnas: ["Día", "Pedidos"],
      datos: datosDias,
      conclusion: conclusionDias,
    },
    {
      id: "ahorro-ofertas",
      numero: 5,
      titulo: "Ahorro por ofertas",
      subtitulo: "Descuento entregado a los clientes cada mes",
      forma: "columnas",
      unidad: "soles",
      columnas: ["Mes", "Ahorro (S/)"],
      datos: datosAhorro,
      conclusion: conclusionAhorro,
    },
    {
      id: "stock-bajo",
      numero: 6,
      titulo: "Productos con menor stock",
      subtitulo: "Unidades disponibles hoy (8 más bajos)",
      forma: "barras",
      unidad: "unidades",
      columnas: ["Producto", "Stock"],
      datos: datosStock,
      conclusion: conclusionStock,
    },
  ];

  return { reportes, indicadores, periodo };
}
