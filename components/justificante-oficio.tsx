"use client";

import React, { useRef } from "react";
import { Justificante } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Download, FileText, Printer } from "lucide-react";
import { formatDate } from "date-fns";
import { es } from "date-fns/locale";

interface JustificanteOficioProps {
  justificante: Justificante;
  tutorName?: string;
}

export function JustificanteOficio({ justificante, tutorName }: JustificanteOficioProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Justificante - ${justificante.estudiante?.name}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; line-height: 1.6; color: #333; }
            .content { max-width: 800px; mx-auto; }
            .header { margin-bottom: 40px; border-bottom: 2px solid #4C0000; padding-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; color: #4C0000; margin: 0; }
            .date { text-align: right; margin-bottom: 40px; }
            .message { margin-bottom: 40px; text-align: justify; }
            .signature { margin-top: 60px; }
            .footer { margin-top: 100px; font-size: 12px; text-align: center; color: #666; border-top: 1px solid #eee; padding-top: 20px; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>
            window.onload = function() { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const fInicio = formatDate(new Date(justificante.fechaInicio), "d 'de' MMMM 'de' yyyy", { locale: es });
  const fFin = formatDate(new Date(justificante.fechaFin), "d 'de' MMMM 'de' yyyy", { locale: es });
  const dateRange = fInicio === fFin ? fInicio : `${fInicio} al ${fFin}`;

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2 no-print">
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Imprimir / Guardar PDF
        </Button>
      </div>

      <div ref={printRef} className="bg-white p-8 sm:p-12 border shadow-sm rounded-lg text-slate-800 leading-relaxed max-w-[800px] mx-auto overflow-hidden">
        <div className="header mb-10 border-b-2 border-[#4C0000] pb-6">
          <h1 className="title text-2xl font-bold text-[#4C0000]">SIJE - Sistema de Justificantes</h1>
          <p className="text-sm text-slate-500 uppercase tracking-wider">Oficio de Justificación de Inasistencia</p>
        </div>

        <div className="date text-right mb-10">
          Cancún, Quintana Roo a {formatDate(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es })}
        </div>

        <div className="message space-y-6 text-justify">
          <p className="font-semibold">Estimado(a) docente:</p>

          <p>
            Por medio de la presente, le informo que el estudiante <span className="font-bold underline">{justificante.estudiante?.name}</span>, tuvo que ausentarse de su clase el <span className="font-bold">{dateRange}</span> por <span className="font-bold">{justificante.motivo}</span> justificados con evidencia. Agradezco su comprensión y apoyo para facilitar, en la medida de lo posible, su regularización académica.
          </p>

          <p>
            Quedo atento a cualquier situación adicional que requiera seguimiento.
          </p>

          <p>Saludos cordiales</p>
        </div>

        <div className="signature mt-16 pt-10">
          <p className="mb-1">Atentamente,</p>
          <div className="mt-12 border-t border-slate-300 w-64">
            <p className="font-bold mt-2">Mtro. {tutorName || "Tutor Asignado"}</p>
            <p className="text-sm text-slate-500 italic">Tutor del grupo</p>
          </div>
        </div>

        <div className="footer mt-24 text-[10px] text-center text-slate-400 border-t pt-4 uppercase tracking-tighter">
          Este documento es una representación digital de una justificación aprobada a través del Sistema SIJE - UPQROO.
        </div>
      </div>
    </div>
  );
}
