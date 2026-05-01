import { Vehiculo } from "./vehiculo";

export interface Usuario {
    id?: number;
    uid?: string;
    registro?: string;
    foto?: string | null;
    contraseña?: string | null;
    telefono?: string,
    vehiculos?: Vehiculo[]
    correo: string;
    nombre: string;
    apellido: string;
    dni: string;
    rol: "dueño"| "cliente";
}
