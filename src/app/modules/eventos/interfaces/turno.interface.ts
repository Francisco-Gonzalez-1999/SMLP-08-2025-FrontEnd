export interface CatTurnoDTO {
  idTurno: number;
  nombre: string;
  horaInicio: string;
  horaFin: string;
  descripcion?: string;
  estaActivo?: boolean;
}
