export interface Arreglo{
    id?: number,
    uid_trabajo?: string,
    estado?: 'completado' | 'en proceso',
    nombre: string,
    problema: string,
    costo: number,
    cantidad: number,
}