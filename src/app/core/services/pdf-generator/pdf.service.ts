import { Injectable } from '@angular/core';
import {
  ClienteInfo,
  PresupuestoItem,
  PresupuestoPdfItem,
} from '../../../shared/models/presupuesto.model';
import jsPDF from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  constructor() {}

  /**
   * Genera un PDF de presupuesto usando jsPDF puro.
   */
  generarPresupuestoPDF(
    items: PresupuestoItem[],
    total: number,
    fecha: Date = new Date()
  ) {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

    // ========================
    // ENCABEZADO
    // ========================
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('PRESUPUESTO', 105, 15, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${fecha.toLocaleDateString('es-AR')}`, 14, 25);
    doc.text(`Cliente: `, 14, 30);
    //if (cliente.telefono) doc.text(`Teléfono: ${cliente.telefono}`, 14, 35);

    // ========================
    // TABLA (tamaño fijo)
    // ========================

    // Convertimos los items en filas
    const filas: RowInput[] = items.map((i) => [
      i.articulo.descripcion,
      i.cantidad.toString(),
      i.precioUnitario.toFixed(2),
      i.subtotal.toFixed(2),
    ]);

    // Si hay menos de 30 ítems, agregamos filas vacías para mantener altura fija
    const filasTotales = 30;
    const vacías = Array(Math.max(0, filasTotales - filas.length)).fill([
      '',
      '',
      '',
      '',
    ]);
    const cuerpo = [...filas, ...vacías];

    autoTable(doc, {
      startY: 45,
      head: [['Artículo', 'Cant.', 'P.Unit.', 'Subtotal']],
      body: cuerpo,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 9,
        lineColor: [0, 0, 0],
        textColor: [0, 0, 0],
        halign: 'left',
        valign: 'middle',
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [255, 255, 255], // blanco
        textColor: [0, 0, 0],
        lineWidth: 0.2,
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 90, halign: 'left' }, // descripción
        1: { cellWidth: 20, halign: 'center' }, // cantidad
        2: { cellWidth: 35, halign: 'right' }, // precio unitario
        3: { cellWidth: 35, halign: 'right' }, // subtotal
      },
      tableLineWidth: 0.2,
      tableLineColor: [0, 0, 0],
    });

    // ========================
    // TOTAL
    // ========================
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`TOTAL: $${total.toFixed(2)}`, 195, finalY, { align: 'right' });

    // ========================
    // OBSERVACIONES
    // ========================
    /*
    if (cliente.observaciones) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('Observaciones:', 14, finalY + 10);
      doc.text(cliente.observaciones, 14, finalY + 15, { maxWidth: 180 });
    }
    */

    // ========================
    // FOOTER
    // ========================
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(
      'Válido por 15 días — Gracias por su preferencia — Artística Arcoiris',
      105,
      285,
      { align: 'center' }
    );

    // ========================
    // DESCARGA
    // ========================
    const nombreArchivo = `presupuesto_${Date.now.toString()}.pdf`;
    doc.save(nombreArchivo);
  }

  /**
   * Genera un PDF de presupuesto con un estilo profesional optimizado para blanco y negro.
   * @param items Los artículos del presupuesto.
   * @param total El total calculado del presupuesto.
   * @param cliente Los datos del cliente (opcional).
   * @param fecha La fecha del presupuesto.
   */
  generarPresupuestoPDF2(
    items: PresupuestoItem[],
    total: number,
    cliente: ClienteInfo = { nombre: 'Consumidor Final' }, // Valor por defecto
    fecha: Date = new Date()
  ) {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

    // --- 1. Definición de Constantes de Estilo (Blanco y Negro) ---
    const blackColor = '#000000';
    const headerGrayColor = '#374151'; // Un gris oscuro para el encabezado de la tabla
    const grayColor = '#4B5563';
    const lightGrayColor = '#E5E7EB'; // Un gris claro para líneas y fondos
    const margin = 14;
    const docWidth = doc.internal.pageSize.getWidth();

    // --- 2. Función de Ayuda para Formatear Moneda ---
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
      }).format(value);
    };

    // --- 3. Encabezado y Pie de Página (se repite en cada página) ---
    const pageHeader = () => {
      // Logo (puedes reemplazar 'URL_DE_TU_LOGO' o quitarlo)
      // doc.addImage('URL_DE_TU_LOGO', 'PNG', margin, 10, 40, 15);

      // Datos de tu empresa
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(grayColor);
      doc.text('DOCUMENTO NO VALIDO COMO FACTURA', docWidth / 2, 5, {
        align: 'center',
      });
      doc.text('Artística Sandoval', docWidth - margin, 15, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(
        'Elena de la Vega 440, Zapala - Neuquén',
        docWidth - margin,
        20,
        {
          align: 'right',
        }
      );
      doc.text(
        'artsandoval@hotmail.com.ar | (2942) 424119',
        docWidth - margin,
        24,
        {
          align: 'right',
        }
      );
    };

    const pageFooter = (data: any) => {
      const pageCount = doc.internal.pages.length;
      doc.setFontSize(9);
      doc.setTextColor(150); // Un gris claro para el número de página
      doc.text(
        `Página ${data.pageNumber} de ${pageCount - 1}`,
        docWidth / 2,
        287,
        { align: 'center' }
      );
    };

    // --- 4. Preparación de los Datos de la Tabla ---
    const tableBody: RowInput[] = items.map((item) => [
      item.articulo.descripcion,
      item.cantidad.toString(),
      formatCurrency(item.precioUnitario),
      formatCurrency(item.subtotal),
    ]);

    // --- 5. Generación del PDF con autoTable ---
    autoTable(doc, {
      // Contenido Principal del Documento (antes de la tabla)
      didDrawPage: (data) => {
        // Llamamos al header en cada página
        pageHeader();

        // Contenido del título (solo en la primera página)
        if (data.pageNumber === 1) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(22);
          doc.setTextColor(blackColor);
          doc.text('PRESUPUESTO', margin, 40);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.setTextColor(grayColor);
          doc.text(
            `Fecha: ${fecha.toLocaleDateString('es-AR')}`,
            docWidth - margin,
            40,
            { align: 'right' }
          );

          // Línea divisoria
          doc.setDrawColor(lightGrayColor);
          doc.line(margin, 45, docWidth - margin, 45);

          // Datos del cliente
          doc.setFont('helvetica', 'bold');
          doc.text('Cliente:', margin, 52);
          doc.setFont('helvetica', 'normal');
          doc.text(cliente.nombre, margin + 15, 52);
          if (cliente.telefono) doc.text(cliente.telefono, margin + 15, 57);
        }

        // Llamamos al footer en cada página
        pageFooter(data);
      },

      // --- Estilos y Contenido de la Tabla ---
      startY: 65, // Posición donde empieza la tabla
      head: [['Artículo', 'Cant.', 'P. Unitario', 'Subtotal']],
      body: tableBody,
      theme: 'striped', // El tema 'striped' añade filas con fondo gris claro alterno
      styles: {
        font: 'helvetica',
        fontSize: 9,
        cellPadding: 2.5,
      },
      headStyles: {
        fillColor: headerGrayColor, // Fondo gris oscuro para el header
        textColor: [255, 255, 255], // Texto blanco
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 90, halign: 'left' },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 35, halign: 'right' },
        3: { cellWidth: 35, halign: 'right' },
      },
      margin: { top: 30, bottom: 25 }, // Márgenes para el contenido de la página
    });

    // --- 6. Sección de Totales (después de la tabla) ---
    const finalY = (doc as any).lastAutoTable.finalY || 65;
    const totalTableStartY = finalY + 8;

    // Usamos una mini tabla para alinear los totales perfectamente
    autoTable(doc, {
      startY: totalTableStartY,
      body: [['TOTAL:', formatCurrency(total * 1.21)]],
      theme: 'plain',
      styles: {
        fontSize: 10,
      },
      columnStyles: {
        0: { halign: 'right', fontStyle: 'bold' },
        1: { halign: 'right', fontStyle: 'bold' },
      },
      // Estilo especial para la fila del TOTAL
      didParseCell: (data) => {
        if (data.row.index === 0) {
          data.cell.styles.fontSize = 14;
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.textColor = blackColor; // Total en negro y negrita
        }
      },
      tableWidth: 80, // Ancho de la tabla de totales
      margin: { left: docWidth - 80 - margin }, // Alineamos la tabla a la derecha
    });

    // --- 7. Pie de Página Final (solo en la última página) ---
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(
      'Presupuesto válido por 15 días. Los precios están sujetos a modificaciones sin previo aviso.',
      margin,
      280
    );

    // --- 8. Descarga del Archivo ---
    const nombreArchivo = `presupuesto_${Date.now()}.pdf`;
    doc.save(nombreArchivo);
  }
}
