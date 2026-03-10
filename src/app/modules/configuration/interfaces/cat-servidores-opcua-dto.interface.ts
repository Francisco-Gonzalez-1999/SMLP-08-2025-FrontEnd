export interface CatServidoresOpcuaDTO {
  idServidorOpcua: number;
  nombre: string;
  descripcion: string | null;
  direccionUrl: string;
  usuario: string | null;
  contrasena: string | null;
  timeoutValueMilisegundos: number | null;
  estaActivo: boolean;
  fechaCreacion: Date;
}

export type ActivarDesactivarServidorOpcuaDTO = Pick<CatServidoresOpcuaDTO, 'idServidorOpcua' | 'estaActivo'>;
