"use client";

// DESCARGA DEL INFORME de reportes en Word (.docx), Excel (.xlsx) y PDF.
// Todo se genera en el navegador: las librerías se cargan solo al pulsar el botón.

import { company } from "@/data/company";
import { soles } from "@/lib/types";
import { descargarBlob, imagenComoDataUrl } from "@/lib/descargas";
import { formatoValor, type Indicadores, type Reporte } from "@/lib/reportes";

export type ImagenGrafico = { dataUrl: string; ancho: number; alto: number } | null;

export type Informe = {
  reportes: Reporte[];
  indicadores: Indicadores;
  periodo: string;
  generadoPor: string;
  imagenes: Record<string, ImagenGrafico>;
};

const TITULO = "Informe de reportes de ventas";
const VERDE: [number, number, number] = [13, 148, 136];

function fechaHoy() {
  return new Date().toLocaleString("es-PE", { timeZone: "America/Lima", dateStyle: "long", timeStyle: "short" });
}

function nombreArchivo(ext: string) {
  const hoy = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima" }).format(new Date());
  return `informe-reportes-mym-${hoy}.${ext}`;
}

function filasIndicadores(ind: Indicadores): [string, string][] {
  return [
    ["Ventas totales", soles(ind.ventas)],
    ["Pedidos", String(ind.pedidos)],
    ["Ticket promedio", soles(ind.ticketPromedio)],
    ["Unidades vendidas", String(ind.unidades)],
    ["Ahorro por ofertas", soles(ind.ahorro)],
  ];
}

function dataUrlABytes(dataUrl: string) {
  const binario = atob(dataUrl.split(",")[1]);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
  return bytes;
}

/* ------------------------------------------------------------------ PDF */
export async function exportarPDF(inf: Informe) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const ancho = doc.internal.pageSize.getWidth();
  const alto = doc.internal.pageSize.getHeight();
  const margen = 15;
  const util = ancho - margen * 2;

  // Portada / encabezado
  try {
    doc.addImage(await imagenComoDataUrl("/images/logo-mark.png"), "PNG", margen, 12, 16, 16);
  } catch {
    // sin logo
  }
  doc.setFont("helvetica", "bold").setFontSize(16).setTextColor(20).text(TITULO, margen + 20, 19);
  doc.setFont("helvetica", "normal").setFontSize(9.5).setTextColor(100);
  doc.text(`${company.name} · Periodo: ${inf.periodo}`, margen + 20, 25);
  doc.text(`Generado el ${fechaHoy()} por ${inf.generadoPor}`, margen + 20, 30);

  autoTable(doc, {
    startY: 38,
    head: [["Indicador", "Valor"]],
    body: filasIndicadores(inf.indicadores),
    styles: { fontSize: 9.5, cellPadding: 2 },
    headStyles: { fillColor: VERDE, textColor: 255 },
    columnStyles: { 1: { halign: "right" } },
    margin: { left: margen, right: margen },
    tableWidth: 100,
  });
  // @ts-expect-error lastAutoTable lo agrega jspdf-autotable
  let y: number = doc.lastAutoTable.finalY + 10;

  for (const r of inf.reportes) {
    const img = inf.imagenes[r.id];
    const altoImg = img ? Math.min((util * img.alto) / img.ancho, 85) : 0;
    const anchoImg = img ? (altoImg * img.ancho) / img.alto : 0;
    const lineas = doc.setFontSize(9.5).splitTextToSize(r.conclusion, util) as string[];
    const necesario = 14 + altoImg + lineas.length * 4.6 + 10;
    if (y + necesario > alto - 15) {
      doc.addPage();
      y = 18;
    }

    doc.setFont("helvetica", "bold").setFontSize(12.5).setTextColor(20);
    doc.text(`Reporte ${r.numero}. ${r.titulo}`, margen, y);
    doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(110).text(r.subtitulo, margen, y + 5);
    y += 9;
    if (img) {
      doc.addImage(img.dataUrl, "PNG", margen, y, anchoImg, altoImg);
      y += altoImg + 4;
    }
    doc.setFont("helvetica", "bold").setFontSize(9.5).setTextColor(...VERDE).text("Descripción del resultado", margen, y);
    y += 4.8;
    doc.setFont("helvetica", "normal").setTextColor(40).text(lineas, margen, y);
    y += lineas.length * 4.6 + 3;

    autoTable(doc, {
      startY: y,
      head: [r.columnas],
      body: r.datos.map((d) => [d.etiqueta, formatoValor(d.valor, r.unidad)]),
      styles: { fontSize: 8.5, cellPadding: 1.5 },
      headStyles: { fillColor: [235, 241, 240], textColor: 30 },
      columnStyles: { 1: { halign: "right" } },
      margin: { left: margen, right: margen },
      tableWidth: 110,
    });
    // @ts-expect-error lastAutoTable lo agrega jspdf-autotable
    y = doc.lastAutoTable.finalY + 12;
  }

  const paginas = doc.getNumberOfPages();
  for (let i = 1; i <= paginas; i++) {
    doc.setPage(i);
    doc.setFontSize(8).setTextColor(140).text(`${company.shortName} · ${TITULO} · Página ${i} de ${paginas}`, ancho / 2, alto - 8, {
      align: "center",
    });
  }
  descargarBlob(doc.output("blob"), nombreArchivo("pdf"));
}

/* ----------------------------------------------------------------- WORD */
export async function exportarWord(inf: Informe) {
  const d = await import("docx");
  const borde = { style: d.BorderStyle.SINGLE, size: 4, color: "D5DEDD" };
  const bordes = { top: borde, bottom: borde, left: borde, right: borde };

  const tabla = (cabecera: [string, string], filas: [string, string][]) =>
    new d.Table({
      width: { size: 70, type: d.WidthType.PERCENTAGE },
      rows: [
        new d.TableRow({
          tableHeader: true,
          children: cabecera.map(
            (t) =>
              new d.TableCell({
                borders: bordes,
                shading: { type: d.ShadingType.CLEAR, color: "auto", fill: "0D9488" },
                children: [new d.Paragraph({ children: [new d.TextRun({ text: t, bold: true, color: "FFFFFF" })] })],
              })
          ),
        }),
        ...filas.map(
          ([a, b]) =>
            new d.TableRow({
              children: [
                new d.TableCell({ borders: bordes, children: [new d.Paragraph(a)] }),
                new d.TableCell({
                  borders: bordes,
                  children: [new d.Paragraph({ text: b, alignment: d.AlignmentType.RIGHT })],
                }),
              ],
            })
        ),
      ],
    });

  const hijos: (InstanceType<typeof d.Paragraph> | InstanceType<typeof d.Table>)[] = [
    new d.Paragraph({ text: TITULO, heading: d.HeadingLevel.TITLE }),
    new d.Paragraph({
      children: [
        new d.TextRun({ text: company.name, bold: true }),
        new d.TextRun({ text: ` · Periodo: ${inf.periodo}` }),
      ],
    }),
    new d.Paragraph({
      children: [new d.TextRun({ text: `Generado el ${fechaHoy()} por ${inf.generadoPor}`, color: "666666", size: 18 })],
      spacing: { after: 240 },
    }),
    new d.Paragraph({ text: "Resumen del periodo", heading: d.HeadingLevel.HEADING_1 }),
    tabla(["Indicador", "Valor"], filasIndicadores(inf.indicadores)),
  ];

  for (const r of inf.reportes) {
    const img = inf.imagenes[r.id];
    hijos.push(
      new d.Paragraph({
        text: `Reporte ${r.numero}. ${r.titulo}`,
        heading: d.HeadingLevel.HEADING_1,
        spacing: { before: 360 },
        pageBreakBefore: r.numero > 1 && r.numero % 2 === 1,
      }),
      new d.Paragraph({ children: [new d.TextRun({ text: r.subtitulo, italics: true, color: "666666" })] })
    );
    if (img) {
      const anchoPx = 600;
      hijos.push(
        new d.Paragraph({
          children: [
            new d.ImageRun({
              type: "png",
              data: dataUrlABytes(img.dataUrl),
              transformation: { width: anchoPx, height: Math.round((anchoPx * img.alto) / img.ancho) },
            }),
          ],
        })
      );
    }
    hijos.push(
      new d.Paragraph({ text: "Descripción del resultado", heading: d.HeadingLevel.HEADING_3 }),
      new d.Paragraph({ text: r.conclusion, spacing: { after: 160 } }),
      tabla(
        r.columnas,
        r.datos.map((x) => [x.etiqueta, formatoValor(x.valor, r.unidad)])
      )
    );
  }

  const documento = new d.Document({
    creator: company.name,
    title: TITULO,
    styles: { default: { document: { run: { font: "Calibri", size: 22 } } } },
    sections: [{ children: hijos }],
  });
  descargarBlob(await d.Packer.toBlob(documento), nombreArchivo("docx"));
}

/* ---------------------------------------------------------------- EXCEL */
export async function exportarExcel(inf: Informe) {
  const ExcelJS = (await import("exceljs")).default;
  const libro = new ExcelJS.Workbook();
  libro.creator = company.name;
  libro.created = new Date();

  const encabezado = (hoja: import("exceljs").Worksheet, fila: number) => {
    hoja.getRow(fila).eachCell((c) => {
      c.font = { bold: true, color: { argb: "FFFFFFFF" } };
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0D9488" } };
    });
  };

  // Hoja 1: resumen con indicadores y descripción de cada reporte
  const resumen = libro.addWorksheet("Resumen");
  resumen.columns = [{ width: 34 }, { width: 22 }, { width: 100 }];
  resumen.addRow([TITULO]).font = { bold: true, size: 15 };
  resumen.addRow([`${company.name} · Periodo: ${inf.periodo}`]);
  resumen.addRow([`Generado el ${fechaHoy()} por ${inf.generadoPor}`]).font = { color: { argb: "FF666666" } };
  resumen.addRow([]);
  resumen.addRow(["Indicador", "Valor"]);
  encabezado(resumen, 5);
  filasIndicadores(inf.indicadores).forEach((f) => resumen.addRow(f));
  resumen.addRow([]);
  const filaReportes = resumen.addRow(["Reporte", "", "Descripción del resultado"]);
  encabezado(resumen, filaReportes.number);
  for (const r of inf.reportes) {
    const fila = resumen.addRow([`${r.numero}. ${r.titulo}`, "", r.conclusion]);
    fila.getCell(3).alignment = { wrapText: true, vertical: "top" };
    fila.getCell(1).alignment = { vertical: "top" };
  }

  // Una hoja por reporte: tabla de datos + imagen del gráfico
  for (const r of inf.reportes) {
    const hoja = libro.addWorksheet(`${r.numero}. ${r.titulo}`.slice(0, 31));
    hoja.columns = [{ width: 36 }, { width: 18 }];
    hoja.addRow([`Reporte ${r.numero}. ${r.titulo}`]).font = { bold: true, size: 13 };
    hoja.addRow([r.subtitulo]).font = { italic: true, color: { argb: "FF666666" } };
    hoja.addRow([]);
    hoja.addRow(r.columnas);
    encabezado(hoja, 4);
    for (const d of r.datos) {
      const fila = hoja.addRow([d.etiqueta, d.valor]);
      fila.getCell(2).numFmt = r.unidad === "soles" ? '"S/" #,##0.00' : "#,##0";
    }
    hoja.addRow([]);
    const desc = hoja.addRow(["Descripción del resultado:"]);
    desc.font = { bold: true };
    const texto = hoja.addRow([r.conclusion]);
    hoja.mergeCells(texto.number, 1, texto.number + 3, 2);
    texto.getCell(1).alignment = { wrapText: true, vertical: "top" };

    const img = inf.imagenes[r.id];
    if (img) {
      const id = libro.addImage({ base64: img.dataUrl, extension: "png" });
      const anchoPx = 560;
      hoja.addImage(id, {
        tl: { col: 3, row: 0 },
        ext: { width: anchoPx, height: Math.round((anchoPx * img.alto) / img.ancho) },
      });
    }
  }

  const buffer = await libro.xlsx.writeBuffer();
  descargarBlob(
    new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    nombreArchivo("xlsx")
  );
}
