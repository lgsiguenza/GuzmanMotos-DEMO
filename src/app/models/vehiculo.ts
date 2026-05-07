import { Usuario } from "./usuario";

export interface Vehiculo{
    //* ============= Parámetros de la base de datos ============= 
    id?: number,
    observaciones?: string,
    chasis?: string,
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