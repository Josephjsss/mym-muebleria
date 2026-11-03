// Desarrolladores del proyecto y su C.V. (Avance 3).
// EDITAR con los datos reales de cada integrante:
//  - foto: guardar en /public/images/equipo/ (ej. "/images/equipo/juan-pablo.jpg")
//  - cvPdf: guardar el C.V. completo (con certificados) en /public/cv/
//    Si el PDF todavía no existe, el botón aparece como "C.V. en preparación".

export type Desarrollador = {
  nombre: string;
  rol: string;
  rama: string;
  resumen: string;
  foto?: string;
  programas: [string, string, string];
  lenguajes: [string, string, string];
  habilidades: [string, string, string, string, string];
  cvPdf: string;
};

export const desarrolladores: Desarrollador[] = [
  {
    nombre: "Joseph Salinas",
    rol: "Backend y base de datos",
    rama: "joseph",
    resumen: "Estudiante de Ingeniería de Sistemas e Informática en la UTP.",
    programas: ["Visual Studio Code", "Git y GitHub", "Supabase"],
    lenguajes: ["TypeScript", "JavaScript", "SQL"],
    habilidades: ["Liderazgo", "Trabajo en equipo", "Comunicación", "Responsabilidad", "Resolución de problemas"],
    cvPdf: "/cv/joseph-salinas.pdf",
  },
  {
    nombre: "Juan Pablo",
    rol: "Coordinador · Frontend y diseño",
    rama: "juan-pablo",
    resumen: "Estudiante de Ingeniería de Sistemas e Informática en la UTP.",
    programas: ["Visual Studio Code", "Git y GitHub", "Figma"],
    lenguajes: ["TypeScript", "HTML y CSS", "JavaScript"],
    habilidades: ["Creatividad", "Trabajo en equipo", "Comunicación", "Adaptabilidad", "Puntualidad"],
    cvPdf: "/cv/juan-pablo.pdf",
  },
];
