// Datos de la página "Nosotros" (Avance 3): equipo del proyecto, empresa y metodología.
// Para poner una foto real: guardar el archivo en /public/images/equipo/ y
// escribir su ruta en `foto` (ej. "/images/equipo/joseph.jpg").

import { company } from "@/data/company";

export type Persona = {
  nombre: string;
  cargo: string;
  descripcion: string;
  foto?: string;
};

// ---------------------------------------------------------------------
// Mapa organizacional del equipo del proyecto (UTP)
// ---------------------------------------------------------------------
export const docente: Persona = {
  nombre: "Manuel Alejandro Ortiz Piñella",
  cargo: "Docente del curso",
  descripcion: "Herramientas de Desarrollo · Ingeniería de Sistemas e Informática, UTP.",
};

export const coordinador: Persona = {
  nombre: "Juan Pablo",
  cargo: "Coordinador del proyecto",
  descripcion: "Asigna las áreas de trabajo, revisa los Pull Requests y une las ramas en main.",
};

export const cargos: Persona[] = [
  {
    nombre: "Joseph Salinas",
    cargo: "Backend y base de datos",
    descripcion: "Supabase (PostgreSQL), login con roles y panel de administración (CRUD).",
  },
  {
    nombre: "Juan Pablo",
    cargo: "Frontend y diseño",
    descripcion: "Páginas públicas, slider, catálogo y diseño adaptable a celulares.",
  },
  {
    nombre: "Joseph Salinas y Juan Pablo",
    cargo: "Pruebas y documentación",
    descripcion: "Pruebas de la web, presentación, diagramas y contacto con la empresa.",
  },
];

// ---------------------------------------------------------------------
// La empresa: jefe, organización y persona de contacto
// ---------------------------------------------------------------------
export const empresa = {
  organizacion: company.name,
  rubro: company.rubro,
  ubicacion: company.location,
  jefe: {
    nombre: company.manager,
    cargo: "Gerente de M&M Mueblería",
    descripcion: "Dirige el negocio y aprobó el desarrollo del catálogo web.",
  } satisfies Persona,
  contacto: {
    nombre: company.contactPerson.name,
    cargo: company.contactPerson.role,
    descripcion: "Nos brindó la entrevista y la información de los productos y servicios.",
  } satisfies Persona,
};

// Por confirmar con la empresa (requisito del Avance 3).
export const finalidad =
  "Dar a conocer a M&M Mueblería fuera de Quilmaná con un catálogo web actualizado, " +
  "facilitar las cotizaciones por WhatsApp y ordenar la gestión de sus productos y " +
  "servicios en una base de datos, en lugar del cuaderno y las hojas de Excel.";

export const agradecimiento =
  "Agradecemos a M&M Mueblería y Taller en Melamine, en especial a " +
  `${company.manager} y a ${company.contactPerson.name}, por abrirnos las puertas ` +
  "de su taller, compartir su historia y confiar en nosotros para este proyecto.";

// ---------------------------------------------------------------------
// Metodología de programación: Scrum
// ---------------------------------------------------------------------
export const fasesScrum = [
  {
    fase: "Planificación",
    detalle: "Con la entrevista a la empresa armamos el Product Backlog: la lista priorizada de todo lo que debe tener la web.",
  },
  {
    fase: "Sprint Planning",
    detalle: "Al inicio de cada sprint elegimos las tareas del avance y las repartimos por integrante y por rama de Git.",
  },
  {
    fase: "Desarrollo",
    detalle: "Cada integrante programa en su rama (joseph / juan-pablo) y sube sus cambios con commits.",
  },
  {
    fase: "Seguimiento diario",
    detalle: "Revisamos el avance por WhatsApp y en GitHub; los bloqueos se resuelven entre los dos.",
  },
  {
    fase: "Revisión (Sprint Review)",
    detalle: "Unimos las ramas en main con Pull Requests y presentamos el avance en la sustentación.",
  },
  {
    fase: "Retrospectiva",
    detalle: "Anotamos qué salió bien y qué mejorar, y lo aplicamos en el siguiente sprint.",
  },
];

export const sprints = [
  { nombre: "Sprint 1", avance: "Avance 1", contenido: "Entrevista, historia, misión, visión, mapa del sitio y wireframes." },
  { nombre: "Sprint 2", avance: "Avance 2", contenido: "Base de datos, catálogo de 26 productos, login con roles y CRUD con búsquedas." },
  { nombre: "Sprint 3", avance: "Avance 3", contenido: "Página Nosotros: equipo, desarrolladores con C.V., empresa y metodología." },
  { nombre: "Sprint 4", avance: "Entrega final", contenido: "Mejoras finales, pruebas completas y presentación del proyecto." },
];
