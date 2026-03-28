import { inject, Injectable, signal } from '@angular/core';
import { RealtimeChannel } from '@supabase/supabase-js';
import { SbService } from './sb-service';
import { Vehiculo } from '../models/vehiculo';

@Injectable({
  providedIn: 'root',
})
export class VehiculoSb {
  //! =================== Variables y servicios ===================
  private sbSvc = inject(SbService);
  private canalVehiculos: RealtimeChannel | null = this.sbSvc.sb.channel('vehiculos-tiemporeal');
  private isCanalInicializado = false;

  //~ =================== Signals
  listaVehiculos = signal<Vehiculo[]>([]);

  //! =================== Métodos CRUD ===================
   async agregarVehiculo(vhcl: Vehiculo)
   {
    const identificador = crypto.randomUUID();
    vhcl.uid = identificador;

    await this.sbSvc.insertar('Vehiculos', vhcl)
  }
   async actualizarVehiculo(vhcl: Vehiculo){
    await this.sbSvc.actualizar('Vehiculo', 'uid', vhcl.uid!, vhcl)
  }
   async eliminarVehiculo(vhcl: Vehiculo){
    await this.sbSvc.eliminar('Vehiculo','uid',vhcl.uid!);
  }



  
  //! =================== Métodos en Tiempo Real ===================
  async iniciarCanalVehiculos() {
    if (this.isCanalInicializado) return;
    await this.recargarListados();
    this.isCanalInicializado = true;
    this.canalVehiculos!
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Vehiculo'
        },
        async (evento) => {
          console.log('Evento realtime recibido:', evento);

          switch (evento.eventType) {
            case 'INSERT':
              setTimeout(async()=> {
                  await this.recargarListados();
              }, 1000);
              break;

            case 'UPDATE':
              await this.recargarListados();
              break;

            case 'DELETE':
              await this.recargarListados();
              break;
          }
        }
      )
      .subscribe((status) => {
        console.log("Estado canal realtime:", status);
      });
  }

  destruirCanalVehiculos() {
    if (this.canalVehiculos) {
      this.sbSvc.sb.removeChannel(this.canalVehiculos);
      this.canalVehiculos = null;
    }
  }
  //! =================== Métodos privados ===================
  private async recargarListados(){
    const lsvhcl = await this.sbSvc.listarTodos<Vehiculo>('Vehiculos')
    this.listaVehiculos.set(lsvhcl);
  }


}
