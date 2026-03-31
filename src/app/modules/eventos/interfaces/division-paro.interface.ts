export interface DividirRegistroParoDTO {
  idRegistroParo: number;
  divisiones: DivisionDetalleDTO[];
  usuarioRegistra: string;
}

export interface DivisionDetalleDTO {
  duracionMinutos: number;
  causaRaiz: string;
  subCausa?: string | null;
  comentarios?: string | null;
}
