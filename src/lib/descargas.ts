"use client";

/** Descarga un archivo generado en el navegador (Blob) con el nombre indicado. */
export function descargarBlob(blob: Blob, nombre: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Lee una imagen (por URL) y la devuelve como data URL PNG. */
export async function imagenComoDataUrl(src: string): Promise<string> {
  const blob = await (await fetch(src)).blob();
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(String(lector.result));
    lector.onerror = reject;
    lector.readAsDataURL(blob);
  });
}

/**
 * Convierte el gráfico SVG (Recharts) que está dentro de `contenedor` en una
 * imagen PNG, para insertarla en los informes Word / Excel / PDF.
 */
export async function svgComoPng(
  contenedor: HTMLElement,
  escala = 2
): Promise<{ dataUrl: string; ancho: number; alto: number } | null> {
  const svg = contenedor.querySelector("svg.recharts-surface") as SVGSVGElement | null;
  if (!svg) return null;
  const { width, height } = svg.getBoundingClientRect();
  if (!width || !height) return null;

  const copia = svg.cloneNode(true) as SVGSVGElement;
  copia.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  copia.setAttribute("width", String(width));
  copia.setAttribute("height", String(height));
  copia.setAttribute("style", "font-family: Arial, Helvetica, sans-serif; font-size: 12px;");
  const texto = new XMLSerializer().serializeToString(copia);
  const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(texto);

  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * escala);
  canvas.height = Math.round(height * escala);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.scale(escala, escala);
  ctx.drawImage(img, 0, 0, width, height);
  return { dataUrl: canvas.toDataURL("image/png"), ancho: width, alto: height };
}
