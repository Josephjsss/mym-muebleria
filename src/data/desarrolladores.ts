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
    nombre: "Joseph Salinas Pérez",
    rol: "Backend y base de datos",
    rama: "joseph",
    resumen:
      "Estudiante de 6.º ciclo de Ingeniería de Sistemas en la UTP. Interesado en desarrollo de software, análisis de datos, bases de datos y seguridad de la información.",
    foto: "/images/equipo/joseph-salinas.jpg",
    programas: ["Microsoft Excel", "Microsoft Office", "Visual Studio Code"],
    lenguajes: ["Java", "JavaScript", "HTML y CSS"],
    habilidades: ["Trabajo en equipo", "Comunicación efectiva", "Liderazgo", "Responsabilidad", "Adaptabilidad"],
    cvPdf: "/cv/joseph-salinas.pdf",
  },
  {
    nombre: "Juan Pablo Castillo Sullón",
    rol: "Coordinador · Frontend y diseño",
    rama: "juan-pablo",
    resumen:
      "Estudiante de Ingeniería de Sistemas con experiencia en automatización industrial. Desarrolla aplicaciones en Excel VBA, JavaScript, HTML y CSS.",
    foto: "/images/equipo/juan-pablo.jpg",
    programas: ["Visual Studio Code", "Microsoft Excel", "Git y GitHub"],
    lenguajes: ["JavaScript", "HTML y CSS", "VBA"],
    habilidades: ["Resolución de problemas", "Pensamiento analítico", "Trabajo en equipo", "Liderazgo", "Comunicación"],
    cvPdf: "/cv/juan-pablo.pdf",
  },
];
