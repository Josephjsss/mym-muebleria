"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { descargarBoletaPDF } from "@/lib/boleta-pdf";
import type { Pedido, PedidoItem } from "@/lib/types";
import { Download, Loader2, Printer } from "lucide-react";

export function BoletaAcciones({ pedido }: { pedido: Pedido & { items: PedidoItem[] } }) {
  const [generando, setGenerando] = useState(false);

  async function descargar() {
    setGenerando(true);
    try {
      await descargarBoletaPDF(pedido);
    } finally {
      setGenerando(false);
    }
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => window.print()}>
        <Printer className="size-4" />
        Imprimir
      </Button>
      <Button size="sm" onClick={descargar} disabled={generando}>
        {generando ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        Descargar PDF
      </Button>
    </div>
  );
}
