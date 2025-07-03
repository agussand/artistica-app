import { ElementRef, Injectable, OnDestroy } from '@angular/core';
import { filter, fromEvent, Subject, Subscription } from 'rxjs';
import { ShortcutEvent } from './shortcut.model';

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

  // Subjects para emitir eventos
  private readonly enterSubject = new Subject<ElementRef>();
  private readonly escapeSubject = new Subject<void>();
  private readonly shortcutSubject = new Subject<ShortcutEvent>();
  private keyboardSubscription: Subscription;

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

    // Solo actuamos sobre las combinaciones que nos interesan.
    const isShortcut =
      (event.altKey && key === 's') || key === 'f2' || key === 'delete';

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
