export interface EvtRegistroParosJustificadoDTO {
  idRegistroParo: number;
  idLinea: number;
  idPlanta: number;
  idTag: number | null;
  idEstadoParo: number;
  idEvento: number;
  fechaRegistro: string;
  horaInicio: string;
  horaFin: string | null;
  duracionMinutos: number | null;
  turno: string | null;
  causaRaiz: string | null;
  subCausa: string | null;
  comentarios: string | null;
  usuarioRegistra: string | null;
  usuarioUltimaMod: string | null;
  fechaCreacion: string;
  fechaUltimaMod: string | null;
  estaActivo: boolean;
  lineaNombre: string | null;
  plantaNombre: string | null;
  tagNombre: string | null;
  estadoParoNombre: string | null;
  eventoNombre: string | null;
}

export interface ActualizarRegistroParoJustificadoDTO {
  idRegistroParo: number;
  causaRaiz: string | null;
  subCausa: string | null;
  comentarios: string | null;
  idEstadoParo?: number | null;
  usuarioUltimaMod: string | null;
}

export interface ActivarDesactivarRegistroParoJustificadoDTO {
  idRegistroParo: number;
  estaActivo: boolean;
  usuarioUltimaMod: string | null;
}

export interface CrearRegistroParoManualDTO {
  idLinea: number;
  idPlanta: number;
  fechaRegistro: string; // YYYY-MM-DD
  horaInicio: string;    // ISO datetime
  horaFin?: string | null; // ISO datetime, opcional
  idEstadoParo?: number | null;
  idEvento?: number | null;
  causaRaiz?: string | null;
  subCausa?: string | null;
  comentarios?: string | null;
  usuarioRegistra: string;
}
