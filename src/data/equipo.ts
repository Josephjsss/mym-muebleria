// Datos de la página "Nosotros" (Avance 3): equipo del proyecto y la empresa.
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
