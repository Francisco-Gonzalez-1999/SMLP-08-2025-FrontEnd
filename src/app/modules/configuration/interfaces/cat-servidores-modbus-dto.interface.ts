export interface CatServidoresModbusDTO {
  idServidorModbus: number;
  idLinea: number | null;
  nombre: string | null;
  descripcion: string | null;
  ip: string;
  puerto: number;
  estacionId: number | null;
  umbralCorriente: number | null;
  estaActivo: boolean;
  fechaCreacion: Date;
}

export type ActivarDesactivarServidorModbusDTO = Pick<CatServidoresModbusDTO, 'idServidorModbus' | 'estaActivo'>;
