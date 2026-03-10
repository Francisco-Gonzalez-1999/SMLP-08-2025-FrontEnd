export interface CatPlcDTO {
  idPlc: number;
  nombre: string | null;
  descripcion: string | null;
  direccionIp: string | null;
  puerto: number | null;
  tipoComunicacion: string | null;
  estaActivo: boolean;
  fechaCreacion: Date;
}

// Para activar/desactivar, se puede usar CatPlcDTO con solo idPlc y estaActivo
export type ActivarDesactivarPlcDTO = Pick<CatPlcDTO, 'idPlc' | 'estaActivo'>;
