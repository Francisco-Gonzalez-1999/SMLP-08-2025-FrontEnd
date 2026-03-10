export interface CatTagDTO {
  idTag: number;
  idPlc: number;
  idLinea: number;
  idServidorOpcua: number;
  nodeId: string;
  nombre: string;
  descripcion: string | null;
  tipoDato: string;
  unidadMedida: string | null;
  valorMin: number | null;
  valorMax: number | null;
  estaActivo: boolean;
  fechaCreacion: Date;
}

export type ActivarDesactivarTagDTO = Pick<CatTagDTO, 'idTag' | 'estaActivo'>;
