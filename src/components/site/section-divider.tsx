/**
 * Divisor angular entre secciones. `className` controla el color via
 * text-color (usa currentColor) y el fondo de la sección que sigue.
 */
export function SectionDivider({
  className,
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  return (
    <div
      className={`pointer-events-none relative h-10 w-full overflow-hidden sm:h-16 ${className ?? ""}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1200 60"
        preserveAspectRatio="none"
        className={`h-full w-full ${flip ? "rotate-180" : ""}`}
      >
        <polygon points="0,60 1200,0 1200,60" fill="currentColor" />
      </svg>
    </div>
  );
}
