export interface CatEsclavosModbuDTO {
  idEsclavoModbus: number;
  idServidorModbus: number | null;
  nombre: string | null;
  descripcion: string | null;
  fase: string | null;
  registroInicio: number;
  registroFin: number;
  estaActivo: boolean;
  fechaCreacion: Date;
}

export type ActivarDesactivarEsclavoModbusDTO = Pick<CatEsclavosModbuDTO, 'idEsclavoModbus' | 'estaActivo'>;
