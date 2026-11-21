import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Navbar } from "@/components/site/navbar";
import { SiteFooter } from "@/components/site/footer";
import { BoletaAcciones } from "@/components/tienda/boleta-acciones";
import { createClient } from "@/lib/supabase/server";
import { obtenerUsuarioActual } from "@/lib/auth";
import { company } from "@/data/company";
import { IGV, numeroBoleta, soles, type Pedido } from "@/lib/types";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Boleta de venta · M&M Mueblería",
};

export default async function BoletaPage(props: PageProps<"/pedidos/[id]">) {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) redirect("/?login=1");

  const { id } = await props.params;
  const { nuevo } = await props.searchParams;
  const idNumero = Number(id);
  if (!Number.isInteger(idNumero)) notFound();

  // RLS: el cliente solo puede leer SUS pedidos (el admin, todos).
  const supabase = await createClient();
  const { data } = await supabase
    .from("pedidos")
    .select("*, items:pedido_items(*)")
    .eq("id", idNumero)
    .maybeSingle();
  if (!data) notFound();
  const pedido = data as Pedido;
  const items = [...(pedido.items ?? [])].sort((a, b) => a.id - b.id);
  const gravada = Number(pedido.total) / (1 + IGV);
  const fecha = new Date(pedido.creado_en).toLocaleString("es-PE", {
    timeZone: "America/Lima",
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <>
      <div className="contents print:hidden">
        <Navbar />
      </div>
      <main className="flex-1 bg-muted/30 print:bg-white">
        <div className="mx-auto max-w-3xl px-4 py-8 print:max-w-none print:p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
            <Link
              href={usuario.rol === "admin" ? "/admin/reportes" : "/pedidos"}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              {usuario.rol === "admin" ? "Volver a reportes" : "Mis pedidos"}
            </Link>
            <BoletaAcciones pedido={{ ...pedido, items }} />
          </div>

          {nuevo === "1" && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary print:hidden">
              <CheckCircle2 className="size-5 shrink-0" />
              ¡Gracias por tu compra! Tu pedido quedó registrado y esta es tu boleta.
            </div>
          )}

          {/* BOLETA */}
          <article className="mt-4 rounded-2xl border bg-card p-6 shadow-sm sm:p-8 print:rounded-none print:border-0 print:shadow-none">
            <header className="flex flex-col gap-5 border-b pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="relative size-14 shrink-0 overflow-hidden rounded-lg border bg-white">
                  <Image src="/images/logo-mark.png" alt="Logo M&M" fill sizes="56px" className="object-contain p-1.5" />
                </span>
                <div className="text-sm">
                  <p className="font-heading text-base font-bold">{company.name}</p>
                  <p className="text-muted-foreground">{company.location}</p>
                  <p className="text-muted-foreground">
                    WhatsApp {company.whatsapp.join(" / ")} · {company.contactEmail}
                  </p>
                </div>
              </div>
              <div className="rounded-xl border-2 border-primary px-5 py-3 text-center sm:min-w-52">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Boleta de venta electrónica
                </p>
                <p className="mt-1 font-mono text-lg font-bold">{numeroBoleta(pedido)}</p>
                {pedido.es_demo && <p className="text-[11px] text-muted-foreground">(dato de demostración)</p>}
              </div>
            </header>

            <dl className="grid gap-x-6 gap-y-2 border-b py-5 text-sm sm:grid-cols-2">
              <Dato etiqueta="Cliente" valor={pedido.cliente_nombre} />
              <Dato etiqueta="DNI" valor={pedido.cliente_dni} />
              <Dato etiqueta="Fecha de emisión" valor={fecha} />
              <Dato etiqueta="Estado" valor={pedido.estado} />
              {pedido.cliente_telefono && <Dato etiqueta="Celular" valor={pedido.cliente_telefono} />}
              {pedido.direccion && <Dato etiqueta="Dirección" valor={pedido.direccion} />}
            </dl>

            <div className="overflow-x-auto">
              <table className="mt-4 w-full min-w-[520px] text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr className="border-b">
                    <th className="py-2 pr-2 font-medium">Cant.</th>
                    <th className="py-2 pr-2 font-medium">Descripción</th>
                    <th className="py-2 pr-2 text-right font-medium">P. unit.</th>
                    <th className="py-2 pr-2 text-right font-medium">Dscto.</th>
                    <th className="py-2 text-right font-medium">Importe</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((it) => (
                    <tr key={it.id}>
                      <td className="py-2.5 pr-2 tabular-nums">{it.cantidad}</td>
                      <td className="py-2.5 pr-2">
                        {it.nombre}
                        <span className="block font-mono text-[11px] text-muted-foreground">{it.codigo}</span>
                      </td>
                      <td className="py-2.5 pr-2 text-right tabular-nums">{soles(it.precio_unitario)}</td>
                      <td className="py-2.5 pr-2 text-right tabular-nums text-muted-foreground">
                        {it.descuento_pct > 0 ? `${it.descuento_pct} %` : "—"}
                      </td>
                      <td className="py-2.5 text-right font-medium tabular-nums">{soles(it.importe)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <dl className="ml-auto mt-4 max-w-64 space-y-1.5 border-t pt-4 text-sm">
              <Total etiqueta="Subtotal" valor={soles(pedido.subtotal)} />
              {Number(pedido.descuento) > 0 && <Total etiqueta="Descuentos" valor={`− ${soles(pedido.descuento)}`} />}
              <Total etiqueta="Op. gravada" valor={soles(gravada)} />
              <Total etiqueta={`IGV (${IGV * 100} %)`} valor={soles(Number(pedido.total) - gravada)} />
              <div className="flex justify-between border-t pt-2 text-base font-bold">
                <dt>Total</dt>
                <dd className="tabular-nums text-primary">{soles(pedido.total)}</dd>
              </div>
            </dl>

            <p className="mt-8 text-center text-xs text-muted-foreground">
              Gracias por confiar en {company.shortName}. Representación impresa de la boleta de venta —
              documento generado para el proyecto del curso (sin validez tributaria).
            </p>
          </article>
        </div>
      </main>
      <div className="print:hidden">
        <SiteFooter />
      </div>
    </>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-32 shrink-0 text-muted-foreground">{etiqueta}</dt>
      <dd className="font-medium">{valor}</dd>
    </div>
  );
}

function Total({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{etiqueta}</dt>
      <dd className="tabular-nums">{valor}</dd>
    </div>
  );
}
