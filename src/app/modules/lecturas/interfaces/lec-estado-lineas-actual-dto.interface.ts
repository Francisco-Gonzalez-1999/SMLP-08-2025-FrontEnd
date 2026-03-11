export interface LecEstadoLineasActualDTO {
  idEstadoLineaActual: number;
  idLinea: number;
  idTag: number;
  estaDetenida: boolean;
  ultimoCambio: Date;
  lineaNombre: string | null;
  plantaNombre: string | null;
  tagNombre: string | null;
}
