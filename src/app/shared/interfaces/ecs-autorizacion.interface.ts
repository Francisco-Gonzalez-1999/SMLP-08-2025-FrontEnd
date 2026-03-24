export interface EcsApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface EcsValidarAccesoRequest {
  idUsuario: number;
  nombreModulo: string;
  nombreAccion: string;
  idSistema?: number;
}

export interface EcsValidarAccesoResponse {
  tieneAcceso: boolean;
  modulo: string;
  accion: string;
  rolOtorgante?: string;
  motivoRechazo?: string;
  fechaValidacion: Date;
}

export interface EcsPermisoActivo {
  idPermiso: number;
  nombreModulo: string;
  nombreAccion: string;
  nombreRol: string;
  nombreSistema: string;
  fechaExpiracionRol?: Date;
  horaInicio?: string;
  horaFin?: string;
  diasSemana?: string;
}

export interface EcsUsuario {
  idUsuario: number;
  nombreCompleto: string;
  correo: string;
  estaActivo: boolean;
}
