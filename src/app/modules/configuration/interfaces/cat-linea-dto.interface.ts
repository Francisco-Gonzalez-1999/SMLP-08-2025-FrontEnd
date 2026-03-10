export interface CatLineaDTO {
  idLinea: number;
  idPlanta: number;
  nombre: string;
  descripcion: string | null;
  estaActivo: boolean;
  fechaCreacion: Date;
}

export type ActivarDesactivarLineaDTO = Pick<CatLineaDTO, 'idLinea' | 'estaActivo'>;
