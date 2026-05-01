import { Usuario } from "./usuario";

export interface Vehiculo{
    //* ============= Parámetros de la base de datos ============= 
    id?: number,
    chasis?: string,
    observaciones?: string,
    uid?: string,
    metraje: string,
    uid_propietario: string,
    modelo: string,
    patente: string,
    //! ============= Parámetros agenos a la base de datos =============
    nombrePropietario?: string ,
    propietario?: Usuario;
    imagenes?: string[]
}