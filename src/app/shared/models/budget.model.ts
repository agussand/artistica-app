import { Articulo } from '../../core/models/articulo.model';

// Representa una línea individual dentro del presupuesto
export interface BudgetItem {
  articulo: Articulo;
  cantidad: number;
  precioUnitario: number; // Guardamos el precio al momento de añadirlo
  subtotal: number;
}
