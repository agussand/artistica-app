import {
  Directive,
  ElementRef,
  HostListener,
  inject,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appCurrencyMask]',
  standalone: true,
})
export class CurrencyMaskDirective implements OnInit {
  @Input() max: number = 9999999.99;

  private el: HTMLInputElement;
  private ngControl = inject(NgControl);

  constructor(private elementRef: ElementRef) {
    this.el = this.elementRef.nativeElement;
  }

  ngOnInit() {
    // Al iniciar, formatea el valor inicial que pueda venir del modelo.
    this.formatValue(this.ngControl.control?.value);
  }

  /**
   * Se dispara en cada pulsación de tecla.
   * Orquesta el formateo y la actualización del valor.
   * @param target El elemento input que disparó el evento.
   */
  @HostListener('input', ['$event.target'])
  onInput(target: HTMLInputElement) {
    // Llama a la función de formateo y luego actualiza el valor.
    const value = this.format(target.value);
    this.updateValue(value);
  }

  /**
   * Se dispara cuando el usuario sale del campo.
   * Asegura que el valor final quede con el formato de moneda estándar.
   */
  @HostListener('blur')
  onBlur() {
    const value = this.ngControl.control?.value;
    this.formatValue(value);
  }

  /**
   * Toma un valor de entrada (string), lo limpia, lo valida y devuelve
   * un string formateado con puntos de miles y coma decimal.
   * @param value El valor actual del input.
   */
  private format(value: string | number | null): string {
    if (value === null || value === undefined) {
      return '';
    }

    // 1. Limpieza: permite solo dígitos y una coma.
    let cleanValue = String(value).replace(/[^0-9,]/g, '');
    const parts = cleanValue.split(',');
    let integerPart = parts[0];
    let decimalPart = parts.length > 1 ? parts[1] : '';

    // Trunca los decimales a 2 caracteres.
    if (decimalPart.length > 2) {
      decimalPart = decimalPart.substring(0, 2);
    }

    // 2. Validación del Límite: convierte a número para chequear el máximo.
    const numericString = `${integerPart}.${decimalPart}`;
    const numericValue = parseFloat(numericString);

    if (!isNaN(numericValue) && numericValue > this.max) {
      // Si se excede, revierte al último valor válido del modelo. Es una estrategia robusta.
      return this.format(this.ngControl.control?.value);
    }

    // 3. Formateo Visual: añade los puntos de miles a la parte entera.
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    // 4. Reconstrucción: devuelve el string formateado para la vista.
    return decimalPart ? `${integerPart},${decimalPart}` : integerPart;
  }

  /**
   * Actualiza tanto el modelo de Angular (con el valor numérico) como la vista (con el string formateado).
   * @param value El string formateado que viene del método `format`.
   */
  private updateValue(value: string) {
    // Convierte el string formateado de vuelta a un número para el modelo.
    const numericString = value.replace(/\./g, '').replace(',', '.');
    const numericValue = parseFloat(numericString);

    // Actualiza el FormControl de Angular sin emitir un nuevo evento 'input'.
    this.ngControl.control?.setValue(
      isNaN(numericValue) ? null : numericValue,
      { emitEvent: false }
    );
    // Actualiza el valor que ve el usuario en el input.
    this.el.value = value;
  }

  /**
   * Formatea un valor numérico a un string de moneda estándar ('es-AR').
   * Ideal para el estado inicial y el evento 'blur'.
   * @param value El valor numérico a formatear.
   */
  private formatValue(value: number | string | null) {
    if (value === null || value === undefined) {
      this.el.value = '';
      return;
    }
    const numValue = parseFloat(String(value));
    if (isNaN(numValue)) {
      this.el.value = '';
      return;
    }

    // toLocaleString es la forma más segura de formatear para una región específica.
    this.el.value = numValue.toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}
