// Tipos que reflejan las tablas de la base de datos (supabase/mym_muebleria.sql).

export type Categoria = {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
};

export type Producto = {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  marca: string;
  tipo: "Producto" | "Servicio";
  duracion: string | null;
  precio: number;
  imagen_url: string;
  categoria_id: number;
  registrado_por: number | null;
  // false = desactivado: no se muestra en la web y se puede reactivar desde el panel.
  activo: boolean;
  // % de oferta: 0 = sin oferta; si hay oferta, mínimo 5 % (lo exige la BD).
  descuento: number;
  // Unidades disponibles para la venta en línea (los servicios no usan stock).
  stock: number;
  creado_en: string;
  actualizado_en: string;
  // Relación con categorias (JOIN que hace Supabase).
  categoria?: { nombre: string } | null;
};

export type Usuario = {
  id: number;
  auth_id: string;
  nombre: string;
  correo: string;
  rol: "admin" | "cliente";
};

// Columnas que se piden siempre al consultar productos (incluye el JOIN).
export const PRODUCTO_SELECT = "*, categoria:categorias(nombre)";

// Campos por los que se puede buscar en el catálogo y en el CRUD.
export const CAMPOS_BUSQUEDA = {
  nombre: "Nombre",
  codigo: "Código",
  marca: "Marca",
  descripcion: "Descripción",
} as const;
export type CampoBusqueda = keyof typeof CAMPOS_BUSQUEDA;

export function formatoPrecio(precio: number) {
  if (Number(precio) === 0) return "Gratis";
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(Number(precio));
}

/** Precio con la oferta aplicada (redondeado a céntimos, igual que en la BD). */
export function precioFinal(p: Pick<Producto, "precio" | "descuento">) {
  return Math.round(Number(p.precio) * (100 - Number(p.descuento ?? 0))) / 100;
}

/** Solo los productos con precio y stock se compran en línea; los servicios se cotizan por WhatsApp. */
export function sePuedeComprar(p: Pick<Producto, "tipo" | "precio">) {
  return p.tipo === "Producto" && Number(p.precio) > 0;
}

export const DESCUENTO_MINIMO = 5;
export const DESCUENTO_MAXIMO = 90;

export type Pedido = {
  id: number;
  serie: string;
  numero: number;
  usuario_id: number;
  cliente_nombre: string;
  cliente_dni: string;
  cliente_telefono: string | null;
  direccion: string | null;
  subtotal: number;
  descuento: number;
  total: number;
  estado: "Pagado" | "Entregado" | "Anulado";
  es_demo: boolean;
  creado_en: string;
  items?: PedidoItem[];
};

export type PedidoItem = {
  id: number;
  pedido_id: number;
  producto_id: number | null;
  codigo: string;
  nombre: string;
  categoria: string;
  cantidad: number;
  precio_unitario: number;
  descuento_pct: number;
  precio_final: number;
  importe: number;
};

/** B001-000023 */
export function numeroBoleta(p: Pick<Pedido, "serie" | "numero">) {
  return `${p.serie}-${String(p.numero).padStart(6, "0")}`;
}

/** Moneda sin el caso "Gratis" (para boletas y reportes). */
export function soles(monto: number) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", minimumFractionDigits: 2 }).format(
    Number(monto)
  );
}

export const IGV = 0.18;

// Quita caracteres que romperían el filtro .or() de Supabase.
export function limpiarTermino(texto: string) {
  return texto.replace(/[,()%*\\]/g, " ").trim();
}
