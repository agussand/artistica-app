import { ElementRef, inject, Injectable, OnDestroy } from '@angular/core';
import { buffer, filter, fromEvent, Subject, Subscription } from 'rxjs';
import { ShortcutEvent } from '../../../shared/models/shortcut.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class KeyboardNavigationService implements OnDestroy {
  /**
   * Almacena las referencias a los elementos del DOM que se han marcado como navegables.
   * Las directivas [keyboardNavigable] se registran aquí.
   */
  public navigableElements: ElementRef[] = [];
  /**
   * Mantiene el índice del elemento actualmente activo/seleccionado dentro del array `navigableElements`.
   * Un valor de -1 significa que no hay ningún elemento seleccionado.
   */
  public activeIndex = -1; // Comienza sin ningún elemento activo

  private router = inject(Router);
  private isPaused = false;

  // Subjects para emitir eventos
  private readonly enterSubject = new Subject<ElementRef>();
  private readonly escapeSubject = new Subject<void>();
  private readonly shortcutSubject = new Subject<ShortcutEvent>();
  private barcodeSubject = new Subject<string>();
  private keyboardSubscription: Subscription;

  public pause(): void {
    this.isPaused = true;
  }
  public resume(): void {
    this.isPaused = false;
  }

  /**
   * Almacena temporalmente los caracteres recibidos en una ráfaga rápida,
   * que se sospecha provienen de un escáner.
   * @private
   */
  private barcodeBuffer: string[] = [];

  /**
   * Marca de tiempo (en milisegundos) de la última pulsación de tecla detectada.
   * Se usa para calcular el tiempo entre teclas.
   * @private
   */
  private lastKeystrokeTime = 0;

  /**
   * Tiempo máximo en milisegundos que puede pasar entre dos pulsaciones de tecla
   * para que se consideren parte del mismo escaneo de código de barras. Si el tiempo
   * es mayor, se asume que es una escritura manual y el buffer se reinicia.
   * @private
   * @readonly
   */
  private readonly BARCODE_TIMEOUT = 50;

  /**
   * Observable público al que los componentes pueden suscribirse para recibir
   * los códigos de barra detectados.
   */
  public onBarcodeScan$ = this.barcodeSubject.asObservable();

  /**
   * Observable que emite cuando se presiona 'Enter' sobre un elemento activo.
   * Los componentes se suscriben a este para ejecutar la acción principal (ej: seleccionar).
   */
  public readonly onEnter$ = this.enterSubject.asObservable();
  /**
   * Observable que emite cuando se presiona 'Escape' sobre un elemento activo.
   * Los componentes se suscriben a este para ejecutar la acción principal (ej: volver atras).
   */
  public readonly onEscape$ = this.escapeSubject.asObservable();
  /**
   * Observable que emite cuando se presiona una combinación de teclas reconocida como un atajo.
   * Los componentes se suscriben a este para ejecutar acciones secundarias (ej: editar, eliminar, enfocar).
   */
  public readonly onShortcut$ = this.shortcutSubject.asObservable();

  constructor() {
    // Escuchamos el evento 'keydown' en todo el documento una sola vez.
    this.keyboardSubscription = fromEvent<KeyboardEvent>(
      document,
      'keydown'
    ).subscribe((event) => {
      // No filtramos, procesamos todas las teclas para poder capturar atajos
      // incluso cuando no hay elementos navegables.
      this.processKeyEvent(event);
    });
  }

  /**
   * Registra un elemento para que sea parte del sistema de navegación.
   * Es llamado por la directiva [keyboardNavigable] en su ngOnInit.
   * @param element La referencia al elemento del DOM a registrar.
   */
  register(element: ElementRef) {
    // Añadimos el elemento al array de navegables
    this.navigableElements.push(element);
  }

  /**
   * Elimina un elemento del sistema de navegación.
   * Es llamado por la directiva [keyboardNavigable] en su ngOnDestroy.
   * @param element La referencia al elemento del DOM a eliminar.
   */
  unregister(element: ElementRef) {
    const index = this.navigableElements.indexOf(element);
    if (index > -1) {
      this.navigableElements.splice(index, 1);
      // Si el elemento des-registrado era el activo, reseteamos
      if (index === this.activeIndex) {
        this.activeIndex = -1;
      }
    }
  }

  /**
   * Procesa cada pulsación de tecla y decide si es una acción de navegación o un atajo.
   * @param event El evento de teclado del navegador.
   */
  private processKeyEvent(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    const now = Date.now();
    const timeSinceLastKey = now - this.lastKeystrokeTime;
    // Si el servicio está pausado, no hacemos NADA, ni siquiera procesamos atajos.
    // El único evento que debe funcionar es el "Escape" del modal, que tiene su propio listener.
    if (this.isPaused) return;

    // Comprobamos si la tecla es un carácter alfanumérico válido
    const isBarcodeCharacter = /^[a-zA-Z0-9]$/.test(key);

    // --- LÓGICA DE DETECCIÓN DE CÓDIGO DE BARRAS (CORREGIDA) ---

    // Si la tecla es "Enter", finalizamos el posible escaneo.
    if (key === 'enter') {
      // Condición para ser un escaneo: Buffer con contenido Y tiempo corto desde la última tecla VÁLIDA.
      if (
        this.barcodeBuffer.length > 2 &&
        timeSinceLastKey <= this.BARCODE_TIMEOUT
      ) {
        const barcode = this.barcodeBuffer.join('');
        this.barcodeSubject.next(barcode);
        this.barcodeBuffer = []; // Limpiamos DESPUÉS de emitir
        event.preventDefault(); // Detenemos el Enter
        return; // Escaneo manejado
      } else {
        // Si no es un escaneo válido (ej. Enter manual), limpiamos el buffer preventivamente.
        this.barcodeBuffer = [];
        // No hacemos 'return', dejamos que el Enter siga para navegación/shortcuts/submit.
      }
    } else if (isBarcodeCharacter) {
      // Si pasó mucho tiempo desde la última tecla VÁLIDA, es una nueva secuencia.
      if (timeSinceLastKey > this.BARCODE_TIMEOUT) {
        this.barcodeBuffer = []; // Reseteamos ANTES de añadir
      }
      this.barcodeBuffer.push(key);
      this.lastKeystrokeTime = now; // Actualizamos el tiempo SOLO para teclas válidas
      // No hacemos 'return', dejamos que la tecla aparezca en el input si es el caso.
    }
    // Solo actuamos sobre las combinaciones que nos interesan.
    const isShortcut =
      (event.altKey && key === 's') ||
      key === 'f2' ||
      key === 'delete' ||
      key === 'f4' ||
      (event.altKey && key === 'n');

    if (isShortcut) {
      event.preventDefault(); // Prevenimos la acción por defecto SOLO para nuestros atajos.
      this.shortcutSubject.next({
        key: key,
        altKey: event.altKey,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
      });
      return;
    }

    // Si no es un atajo, procesamos como navegación (solo si hay elementos navegables).
    if (this.navigableElements.length > 0) {
      switch (key) {
        case 'arrowdown':
          event.preventDefault();
          this.moveNext();
          break;
        case 'arrowup':
          event.preventDefault();
          this.movePrevious();
          break;
        case 'enter':
          event.preventDefault();
          if (this.activeIndex !== -1) {
            this.enterSubject.next(this.navigableElements[this.activeIndex]);
          }
          break;
        case 'escape':
          event.preventDefault();
          this.activeIndex = -1;
          this.navigableElements.forEach((el) => el.nativeElement.blur());
          break;
      }
    }

    // Lógica de Escape Global
    /*
    if (key === 'escape') {
      if (this.router.url !== '/dashboard') {
        event.preventDefault();
        this.router.navigate(['/dashboard']);
      }
    }
    */
  }

  private moveNext(): void {
    if (this.navigableElements.length === 0) return;

    this.activeIndex =
      this.activeIndex < this.navigableElements.length - 1
        ? this.activeIndex + 1
        : 0; // Vuelve al inicio si llega al final

    this.focusActiveElement();
  }

  private movePrevious(): void {
    if (this.navigableElements.length === 0) return;

    this.activeIndex =
      this.activeIndex > 0
        ? this.activeIndex - 1
        : this.navigableElements.length - 1; // Va al final si está en el inicio

    this.focusActiveElement();
  }

  private focusActiveElement() {
    if (this.activeIndex > -1) {
      const activeElement =
        this.navigableElements[this.activeIndex].nativeElement;
      // Hacemos scroll para que el elemento sea visible y lo enfocamos.
      activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      activeElement.focus({ preventScroll: true }); // Usamos .focus() que es la función correcta
    }
  }

  ngOnDestroy(): void {
    if (this.keyboardSubscription) {
      this.keyboardSubscription.unsubscribe();
    }
  }
}
