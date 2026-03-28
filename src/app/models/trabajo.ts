export interface Trabajo{
    id?: number,
    uid?: string
    ingreso?: string,
    egreso?: string | 'En proceso',
    usuario: string,
    vehiculo: string,
    descripcion: string,
    estado?: 'en proceso' | 'solicitado' | 'completado'
    presupuesto: string | 'No definido',
}