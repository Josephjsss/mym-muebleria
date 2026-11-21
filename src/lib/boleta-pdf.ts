"use client";

import { company } from "@/data/company";
import { IGV, numeroBoleta, soles, type Pedido, type PedidoItem } from "@/lib/types";
import { descargarBlob, imagenComoDataUrl } from "@/lib/descargas";

/** Genera la boleta en PDF (jsPDF) y la descarga. */
export async function descargarBoletaPDF(pedido: Pedido & { items: PedidoItem[] }) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const ancho = doc.internal.pageSize.getWidth();
  const verde: [number, number, number] = [13, 148, 136];

  // Encabezado: logo + empresa
  try {
    doc.addImage(await imagenComoDataUrl("/images/logo-mark.png"), "PNG", 15, 14, 18, 18);
  } catch {
    // Sin logo si no se pudo cargar.
  }
  doc.setFont("helvetica", "bold").setFontSize(12).text(company.name, 37, 19);
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(90);
  doc.text(company.location, 37, 24);
  doc.text(`WhatsApp ${company.whatsapp.join(" / ")} · ${company.contactEmail}`, 37, 29);

  // Recuadro del número de boleta
  doc.setDrawColor(...verde).setLineWidth(0.6).roundedRect(ancho - 75, 12, 60, 22, 2, 2);
  doc.setTextColor(90).setFontSize(8).text("BOLETA DE VENTA ELECTRÓNICA", ancho - 45, 19, { align: "center" });
  doc.setTextColor(20).setFont("courier", "bold").setFontSize(13);
  doc.text(numeroBoleta(pedido), ancho - 45, 27, { align: "center" });

  // Datos del cliente
  const fecha = new Date(pedido.creado_en).toLocaleString("es-PE", {
    timeZone: "America/Lima",
    dateStyle: "long",
    timeStyle: "short",
  });
  const datos: [string, string][] = [
    ["Cliente", pedido.cliente_nombre],
    ["DNI", pedido.cliente_dni],
    ["Fecha de emisión", fecha],
    ["Estado", pedido.estado],
  ];
  if (pedido.cliente_telefono) datos.push(["Celular", pedido.cliente_telefono]);
  if (pedido.direccion) datos.push(["Dirección", pedido.direccion]);

  let y = 45;
  doc.setFontSize(9.5);
  for (const [etiqueta, valor] of datos) {
    doc.setFont("helvetica", "normal").setTextColor(110).text(etiqueta, 15, y);
    doc.setFont("helvetica", "bold").setTextColor(20).text(valor, 50, y);
    y += 5.5;
  }

  // Detalle
  autoTable(doc, {
    startY: y + 3,
    head: [["Cant.", "Código", "Descripción", "P. unit.", "Dscto.", "Importe"]],
    body: pedido.items.map((it) => [
      String(it.cantidad),
      it.codigo,
      it.nombre,
      soles(it.precio_unitario),
      it.descuento_pct > 0 ? `${it.descuento_pct} %` : "—",
      soles(it.importe),
    ]),
    styles: { fontSize: 9, cellPadding: 2.2 },
    headStyles: { fillColor: verde, textColor: 255 },
    columnStyles: { 0: { halign: "center" }, 3: { halign: "right" }, 4: { halign: "right" }, 5: { halign: "right" } },
    margin: { left: 15, right: 15 },
  });

  // Totales
  const gravada = Number(pedido.total) / (1 + IGV);
  const filas: [string, string][] = [["Subtotal", soles(pedido.subtotal)]];
  if (Number(pedido.descuento) > 0) filas.push(["Descuentos", `- ${soles(pedido.descuento)}`]);
  filas.push(["Op. gravada", soles(gravada)], [`IGV (${IGV * 100} %)`, soles(Number(pedido.total) - gravada)]);

  // @ts-expect-error lastAutoTable lo agrega jspdf-autotable
  y = (doc.lastAutoTable?.finalY ?? y) + 8;
  doc.setFontSize(9.5);
  for (const [etiqueta, valor] of filas) {
    doc.setFont("helvetica", "normal").setTextColor(110).text(etiqueta, ancho - 75, y);
    doc.setTextColor(20).text(valor, ancho - 15, y, { align: "right" });
    y += 5.5;
  }
  doc.setDrawColor(200).setLineWidth(0.2).line(ancho - 75, y - 2, ancho - 15, y - 2);
  doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(...verde);
  doc.text("TOTAL", ancho - 75, y + 4);
  doc.text(soles(pedido.total), ancho - 15, y + 4, { align: "right" });

  doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(130);
  doc.text(
    `Gracias por confiar en ${company.shortName}. Documento generado para el proyecto del curso (sin validez tributaria).`,
    ancho / 2,
    285,
    { align: "center" }
  );

  descargarBlob(doc.output("blob"), `boleta-${numeroBoleta(pedido)}.pdf`);
}
