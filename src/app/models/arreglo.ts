export interface Arreglo{
    id?: number,
    trabajo?: string,
    estado?: 'completado' | 'en proceso',
    nombre: string,
    problema: string,
    costo: number,
    cantidad: number,
}