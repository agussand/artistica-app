export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // El número de la página actual (base 0)
  first: boolean;
  last: boolean;
  empty: boolean;
}
