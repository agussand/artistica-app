export interface TableColumn {
  /** El nombre de la propiedad del objeto a mostrar. Ej: 'descripcion' */
  field: string;

  /** El texto que aparecerá en el encabezado de la tabla. Ej: 'Descripción' */
  header: string;

  /** Opcional: Un pipe para formatear el dato (ej: 'currency', 'date'). */
  pipe?: 'currency' | 'date';

  /** Opcional: Argumentos para el pipe. Ej: '1.2-2' para el pipe number. */
  pipeArgs?: string;
}
