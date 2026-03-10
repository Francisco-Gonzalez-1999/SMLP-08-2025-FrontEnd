export interface CatTagsGrupoDTO {
  idTagGrupo: number;
  idTag: number | null;
  idGrupoTag: number | null;
  estaActivo: boolean;
  fechaCreacion: Date;
}

export interface CatTagsGrupoConRelacionesDTO {
  idTagGrupo: number;
  idTag: number | null;
  idGrupoTag: number | null;
  estaActivo: boolean;
  fechaCreacion: Date;
  tagNombre: string | null;
  tagNodeId: string | null;
  tagTipoDato: string | null;
  grupoTagNombre: string | null;
  grupoTagDescripcion: string | null;
}

export type ActivarDesactivarTagGrupoDTO = Pick<CatTagsGrupoDTO, 'idTagGrupo' | 'estaActivo'>;
