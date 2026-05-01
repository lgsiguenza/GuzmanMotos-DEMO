import { Arreglo } from "./arreglo"
import { Vehiculo } from "./vehiculo";

export interface Trabajo{
    id?: number,
    uid?: string
    ingreso?: string,
    egreso?: string | 'En proceso',
    vehiculo?: Vehiculo;
    arreglos?: Arreglo[];
    imagenes?: string[],
    estado: 'en proceso' | 'solicitado' | 'completado'
    uid_vehiculo: string,
    descripcion: string,
    presupuesto: string | 'No definido',
}