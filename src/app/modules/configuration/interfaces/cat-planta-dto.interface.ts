export interface CatPlantaDTO {
  idPlanta: number;
  nombre: string;
  descripcion: string | null;
  estaActivo: boolean;
  fechaCreacion: Date;
}

export type ActivarDesactivarPlantaDTO = Pick<CatPlantaDTO, 'idPlanta' | 'estaActivo'>;
