import { inject, Injectable, signal } from '@angular/core';
import { SbService } from './sb-service';
import { Trabajo } from '../models/trabajo';
import { Arreglo } from '../models/arreglo';
import { RealtimeChannel } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class TrabajoSb {
  //! =================== Variables y servicios ===================
  private sbSvc = inject(SbService);
  private canalTrabajos: RealtimeChannel | null = this.sbSvc.sb.channel('trabajos-tiemporeal');
  private isCanalInicializado = false;

  //~ =================== Signals
  listaTrabajos = signal<Trabajo[]>([]);
  listaArreglos = signal<Arreglo[]>([]);

  //! =================== Métodos CRUD ===================
  async obtenerListadoArreglos(uuid: string){
    const lista = await this.sbSvc.listarTodosFiltrados<Arreglo>('Arreglos','trabajo',uuid);
    return lista
  } 
  
  async agregarTrabajo(tbj: Trabajo, arr: Arreglo[])
   {
    const identificador = crypto.randomUUID();
    tbj.uid = identificador;

    const arreglos = arr.map((ar) => ({
      ...ar,
      trabajo: tbj.uid
    }));
    await this.sbSvc.insertar('Trabajos', tbj)

    await Promise.all(
      arreglos.map(ar => this.sbSvc.insertar('Arreglos', ar))
    );
  }

   async actualizarTrabajo(tbj: Trabajo, arreglos: Arreglo[]){
    await this.sbSvc.actualizar('Trabajo', 'uid', tbj.uid!, tbj)
    await Promise.all(
      arreglos.map(ar => this.sbSvc.actualizar('Arreglos','trabajo',ar.trabajo!,ar))
    );
  }
   async eliminarTrabajo(tbj: Trabajo){
    await this.sbSvc.eliminar('Trabajo','uid',tbj.uid!);
  }

  listarArreglos(tbj: Trabajo){
    return this.listaArreglos().filter((a) => a.trabajo === tbj.uid);
  }

  
  //! =================== Métodos en Tiempo Real ===================
  async iniciarCanalTrabajos() {
    if (this.isCanalInicializado) return;
    await this.recargarListados();
    this.isCanalInicializado = true;
    this.canalTrabajos!
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Trabajo'
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

  destruirCanalTrabajos() {
    if (this.canalTrabajos) {
      this.sbSvc.sb.removeChannel(this.canalTrabajos);
      this.canalTrabajos = null;
    }
  }
  //! =================== Métodos privados ===================
  private async recargarListados(){
    const lsTbj = await this.sbSvc.listarTodos<Trabajo>('Trabajos')
    const lsArgls = await this.sbSvc.listarTodos<Arreglo>('Arreglos')
    this.listaTrabajos.set(lsTbj);
    this.listaArreglos.set(lsArgls);
  }



}
