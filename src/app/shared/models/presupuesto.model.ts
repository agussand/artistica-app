import { Articulo } from '../../core/models/articulo.model';

// Representa una línea individual dentro del presupuesto
export interface PresupuestoItem {
  articulo: Articulo;
  cantidad: number;
  precioUnitario: number; // Guardamos el precio al momento de añadirlo
  subtotal: number;
}

export interface PresupuestoPdfItem {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface ClienteInfo {
  nombre: string;
  telefono?: string;
  observaciones?: string;
}
