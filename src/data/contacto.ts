// Datos de la página Contacto.

/** Asuntos del formulario (los mismos que permite la tabla mensajes_contacto). */
export const ASUNTOS = ["Cotización", "Consulta", "Pedido", "Reclamo", "Otro"] as const;

/** Lo que se busca en Google Maps para ubicar la tienda/taller. */
export const UBICACION_MAPA = "Quilmaná, Cañete, Lima, Perú";

/** Slider de la página Contacto (4 imágenes; el requisito es de 3 a 6). */
export const slidesContacto = [
  {
    image: "/images/cotizacion-1.jpg",
    etiqueta: "Cotiza gratis",
    titulo: "Cuéntanos qué mueble necesitas",
    texto: "Te respondemos con una cotización según tus medidas y el acabado que elijas.",
  },
  {
    image: "/images/armado-2.jpg",
    etiqueta: "Visítanos",
    titulo: "Nuestro taller en Quilmaná",
    texto: "Mira los acabados en persona y conversa con el equipo que fabrica tu mueble.",
  },
  {
    image: "/images/servicio-diseno.jpg",
    etiqueta: "Diseño a medida",
    titulo: "Tomamos medidas en tu casa",
    texto: "Diseñamos el mueble para el espacio real de tu ambiente.",
  },
  {
    image: "/images/cocina-3.jpg",
    etiqueta: "Atención directa",
    titulo: "Escríbenos por WhatsApp",
    texto: "Resolvemos tus dudas sobre pedidos, entregas e instalación.",
  },
];
