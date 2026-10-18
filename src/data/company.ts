// Datos reales de la empresa (entrevista + redes sociales + brief oficial).
// Los campos marcados TODO faltan por confirmar con la empresa.

export const company = {
  name: "M&M Mueblería y Taller en Melamine",
  shortName: "M&M",
  tagline: "Fabricantes de muebles en melamina a tu medida",
  rubro: "Mueblería y taller de fabricación en melamina",
  location: "Quilmaná, Cañete, Lima",
  manager: "Michell Guerrero",
  specialist: "Carlos M. Guerrero Quispe",
  whatsapp: ["916 545 909", "921 003 264"],
  // TODO: pedir un correo real de contacto (Michell o Carlos)
  contactEmail: "contacto@mymmuebleria.pe",
  contactPerson: {
    name: "Carlos M. Guerrero Quispe",
    role: "Especialista / Taller",
  },
  social: {
    facebook:
      "https://www.facebook.com/MyMmuebleriaytallerdemelamine",
    tiktok: "https://www.tiktok.com/@mymmuebleria2",
  },
  about: `M&M Mueblería nació en plena época de pandemia, hace aproximadamente 5 años,
gracias al esfuerzo, la visión y los ahorros iniciales de sus fundadores en
Cañete - Quilmaná. Comenzamos operando de manera muy rústica, fabricando
nuestros primeros trabajos y cortando piezas con una inversión inicial
modesta, trabajando inicialmente desde una sala y adaptándonos a las
dificultades del contexto nacional.

Con el paso del tiempo, el compromiso con la excelencia nos permitió crecer,
alquilar un local comercial y ampliar nuestras instalaciones físicas con
maquinaria especializada para el corte y canteado de tableros. Hoy en día,
nos hemos consolidado como un taller y mueblería de referencia en Lima
Provincia.

Trabajamos de la mano con marcas de prestigio como Pelikano para garantizar
acabados de la más alta calidad, ofreciendo tanto muebles de línea con
medidas estándar como proyectos completamente personalizados, diseñados
según el espacio real de cada cliente.`,
  mission:
    "Diseñar y fabricar muebles funcionales y de calidad para el hogar, tanto en modelos estándar como personalizados, brindando una atención cercana y de confianza para convertir los espacios de nuestros clientes en lugares cómodos y acogedores.",
  vision:
    "Consolidarnos en los próximos años como una mueblería de referencia en Lima Sur, modernizando nuestros canales de atención digital y expandiendo nuestro mercado para llegar a más hogares que buscan calidad y buen diseño.",
  objectives: {
    main: [
      "Duplicar el volumen de ventas y ampliar el alcance comercial del negocio, llegando a más clientes fuera de la localidad de Quilmaná mediante el uso de la plataforma digital.",
      "Digitalizar la atención al cliente implementando un catálogo web interactivo y actualizado que facilite la consulta de precios y modelos.",
    ],
    specific: [
      "Facilitar la búsqueda y selección rápida de productos organizados por categorías (roperos, reposteros, camas, etc.).",
      "Agilizar la gestión de cotizaciones y diseños personalizados apoyándose en herramientas tecnológicas, para dar respuestas ágiles a las consultas de los clientes.",
      "Proyectar formalidad y confianza en el entorno digital, mostrando catálogos claros y asegurando un canal de comunicación directo (como WhatsApp) desde la web.",
    ],
  },
  history: `M&M nació hace aproximadamente 5 años, en plena pandemia, con una inversión
inicial modesta: cortando piezas y fabricando los primeros trabajos desde
una sala de casa. Con el compromiso con la excelencia, el negocio creció
hasta alquilar un local comercial propio y equiparlo con maquinaria
especializada para el corte y canteado de tableros, consolidándose como un
taller y mueblería de referencia en Lima Provincia.`,
  products: [
    { name: "Roperos", description: "A medida o en línea estándar" },
    { name: "Camas y camarotes", description: "Distintos tamaños y diseños" },
    { name: "Reposteros", description: "Para dormitorio y áreas de servicio" },
    { name: "Closets", description: "Diseñados según el espacio del cliente" },
    { name: "Muebles de cocina", description: "Con tratamiento para sellado" },
    { name: "Comedores y muebles de sala", description: "Diseños a pedido" },
  ],
  services: [
    {
      name: "Cotización de proyectos a medida",
      description:
        "Tomamos las medidas de tu espacio y diseñamos el mueble a tu gusto.",
    },
    {
      name: "Armado e instalación",
      description: "Servicio de armado de muebles en el domicilio del cliente.",
    },
  ],
  // Testimonios ilustrativos (redactados para la demo web, no citas textuales verificadas).
  testimonials: [
    {
      name: "Rosa Huamán",
      location: "Quilmaná, Cañete",
      quote:
        "Les encargué mi ropero y quedó exactamente como lo imaginé. El acabado en melamina se ve fino y aprovecharon bien cada centímetro de mi cuarto.",
      rating: 5,
    },
    {
      name: "Jorge Salvatierra",
      location: "San Vicente de Cañete",
      quote:
        "Muy buena atención desde la cotización hasta la instalación. El mueble de cocina llegó a tiempo y el equipo fue puntual para el armado en casa.",
      rating: 5,
    },
    {
      name: "Milagros Ccorimanya",
      location: "Imperial, Cañete",
      quote:
        "Necesitaba un closet a la medida para un espacio bien reducido y lo resolvieron perfecto. Se nota la experiencia trabajando proyectos personalizados.",
      rating: 5,
    },
    {
      name: "Édgar Palomino",
      location: "Quilmaná, Cañete",
      quote:
        "El repostero que hicieron para mi cocina superó lo que esperaba por el precio. Buen material, buen sellado y me explicaron bien las medidas antes de fabricar.",
      rating: 4,
    },
    {
      name: "Katherine Vilca",
      location: "Nuevo Imperial, Cañete",
      quote:
        "Compré una cama con cajones para aprovechar espacio y el resultado fue muy sólido. Respondieron rápido por WhatsApp durante todo el proceso.",
      rating: 5,
    },
    {
      name: "Luis Arapa",
      location: "Quilmaná, Cañete",
      quote:
        "Pedí un mueble de comedor a medida y quedó tal cual lo conversamos. Cumplieron con el tiempo de entrega que me dijeron desde el inicio.",
      rating: 5,
    },
    {
      name: "Fiorella Mendoza",
      location: "San Vicente de Cañete",
      quote:
        "Renové toda mi cocina con ellos. El trato fue cercano y honesto en el precio, y el mueble se ve mucho más fino de lo que esperaba.",
      rating: 5,
    },
    {
      name: "Renzo Quispe",
      location: "Imperial, Cañete",
      quote:
        "Buen servicio de armado e instalación, llegaron puntuales y dejaron todo limpio. Recomendado si buscas un trabajo prolijo.",
      rating: 4,
    },
    {
      name: "Doris Ñahui",
      location: "Quilmaná, Cañete",
      quote:
        "Cotizaron rápido por WhatsApp y me asesoraron bien con las medidas de mi ropero. Muy conformes con el resultado final.",
      rating: 5,
    },
  ],
  clients: [
    {
      type: "Público particular",
      description:
        "Familias y personas naturales: nuestros principales compradores. Buscan amoblar ambientes específicos de sus casas (dormitorios, salas o cocinas) o solicitan proyectos a medida adaptados al espacio exacto de sus viviendas.",
    },
    {
      type: "Optimización de espacios pequeños",
      description:
        "Propietarios de departamentos o casas con áreas reducidas que requieren soluciones funcionales hechas a la medida exacta.",
    },
  ],
  categories: [
    { name: "Roperos", icon: "shirt" as const },
    { name: "Camas", icon: "bed" as const },
    { name: "Reposteros", icon: "archive" as const },
    { name: "Closets", icon: "door" as const },
    { name: "Cocinas", icon: "kitchen" as const },
    { name: "Servicios", icon: "service" as const },
  ],
  allies: [
    {
      name: "Pelikano",
      description: "Paneles decorativos",
      logo: "/images/aliado-pelikano.png",
      url: "https://www.pelikano.com/",
    },
    {
      name: "Paneles Andinos",
      description: "Paneles y melamina",
      logo: "/images/aliado-paneles-andinos.png",
      url: "https://www.facebook.com/p/Paneles-andinos-100050318328884/?locale=es_LA",
    },
    {
      name: "Melamina Vesto",
      description: "Proveedor de melamina",
      logo: "/images/aliado-melamina-vesto.png",
      url: "https://arauco.com/peru/marcas/vesto/",
    },
    {
      name: "Tableros Hispanos",
      description: "Proveedor de tableros",
      logo: "/images/aliado-tableros-hispanos.png",
      url: "https://tableroshispanos.es/",
    },
  ],
} as const;

/** Enlace a WhatsApp (wa.me) con un mensaje ya escrito. Lo usan el slider y el footer. */
export function whatsappHref(
  mensaje = "Hola, quisiera cotizar un mueble a medida.",
  numero: string = company.whatsapp[0]
) {
  return `https://wa.me/51${numero.replace(/\D/g, "")}?text=${encodeURIComponent(mensaje)}`;
}

export const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Nosotros", href: "/#nosotros" },
  { label: "Productos", href: "/productos" },
  { label: "Contacto", href: "#contacto" },
] as const;
