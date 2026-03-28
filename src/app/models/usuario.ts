export interface Usuario {
    id?: number;
    uid?: string;
    registro?: string;
    foto?: string | null;
    contraseña?: string | null;
    telefono?: string,
    correo: string;
    nombre: string;
    apellido: string;
    dni: string;
    rol: "dueño"| "cliente";
}
