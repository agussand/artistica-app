export interface Articulo {
  id: number;
  descripcion: string;
  codigoBarra: string;
  precioLista: number;
  precioVenta: number;
  tasiva: number;

  // Campos opcionales para la vista de administrador.
  // El '?' significa que estas propiedades pueden no existir en el objeto.
  subCategoria?: string;
  status?: 'ACTIVO' | 'INACTIVO';
  fechaAlta?: string;
  ultModificacion?: string;
  fechaEliminado?: string | null;
}
