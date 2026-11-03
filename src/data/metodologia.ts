// Metodología de programación (Avance 3): Scrum con sus fases y los 4 sprints.

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
