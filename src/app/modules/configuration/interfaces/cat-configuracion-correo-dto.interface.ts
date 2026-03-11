export interface CatConfiguracionCorreoDTO {
  idConfiguracionCorreo: number;
  tipoConfiguracion: string;
  nombre: string | null;
  email: string;
  estaActivo: boolean;
  fechaCreacion?: Date;
  fechaActualizacion?: Date | null;
}

export interface ActivarDesactivarConfiguracionCorreoDTO {
  idConfiguracionCorreo: number;
  estaActivo: boolean;
}
