export interface CatEventoDTO {
  idEvento: number;
  nombre: string | null;
  descripcion: string | null;
  estaActivo: boolean;
  fechaCreacion?: Date;
}

export interface ActivarDesactivarEventoDTO {
  idEvento: number;
  estaActivo: boolean;
}
