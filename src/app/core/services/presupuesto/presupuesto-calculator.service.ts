import { Injectable } from '@angular/core';
import { PresupuestoItem } from '../../../shared/models/presupuesto.model';

@Injectable({
  providedIn: 'root',
})
export class PresupuestoCalculatorService {
  constructor() {}

  /**
   * Calcula el subtotal de un ítem individual
   * @param cantidad cantidad del artículo
   * @param precioUnitario precio unitario del artículo
   */
  calcularSubtotal(cantidad: number, precioUnitario: number): number {
    const cantidadValida = Math.max(0, cantidad || 0);
    const precioValido = Math.max(0, precioUnitario || 0);
    return +(cantidadValida * precioValido).toFixed(2);
  }

  /**
   * Recalcula los subtotales de todos los ítems
   * y devuelve un nuevo arreglo actualizado.
   */
  recalcularItems(items: PresupuestoItem[]): PresupuestoItem[] {
    return items.map((item) => ({
      ...item,
      subtotal: this.calcularSubtotal(item.cantidad, item.precioUnitario),
    }));
  }

  /**
   * Calcula el total general del presupuesto.
   * @param items lista de ítems del presupuesto
   */
  calcularTotal(items: PresupuestoItem[]): number {
    if (!items?.length) return 0;
    return +items
      .reduce((acc, item) => acc + (item.subtotal || 0), 0)
      .toFixed(2);
  }

  /**
   * Devuelve un objeto con todos los cálculos actualizados:
   * subtotales y total general.
   */
  recalcularPresupuesto(items: PresupuestoItem[]): {
    itemsActualizados: PresupuestoItem[];
    total: number;
  } {
    const itemsActualizados = this.recalcularItems(items);
    const total = this.calcularTotal(itemsActualizados);
    return { itemsActualizados, total };
  }
}
