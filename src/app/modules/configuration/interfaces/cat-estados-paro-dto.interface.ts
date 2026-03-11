export interface CatEstadosParoDTO {
  idEstadoParo: number;
  nombre: string;
  descripcion: string | null;
  colorHex: string | null;
  estaActivo: boolean;
  fechaCreacion?: Date;
}

export interface ActivarDesactivarEstadoParoDTO {
  idEstadoParo: number;
  estaActivo: boolean;
}
