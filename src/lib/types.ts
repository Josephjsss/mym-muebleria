// Tipos que reflejan las tablas de la base de datos (supabase/mym_avance2.sql).

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

// Quita caracteres que romperían el filtro .or() de Supabase.
export function limpiarTermino(texto: string) {
  return texto.replace(/[,()%*\\]/g, " ").trim();
}
