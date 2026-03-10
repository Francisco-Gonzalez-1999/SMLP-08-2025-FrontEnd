export interface CatGruposTagDTO {
  idGrupoTag: number;
  idPlanta: number | null;
  nombre: string | null;
  descripcion: string | null;
  estaActivo: boolean;
  fechaCreacion: Date;
}

export type ActivarDesactivarGrupoTagDTO = Pick<CatGruposTagDTO, 'idGrupoTag' | 'estaActivo'>;
