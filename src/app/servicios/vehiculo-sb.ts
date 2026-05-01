import { inject, Injectable, signal } from '@angular/core';
import { RealtimeChannel } from '@supabase/supabase-js';
import { SbService } from './sb-service';
import { Vehiculo } from '../models/vehiculo';
import { Usuario } from '../models/usuario';

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
  vehiculoSeleccionado = signal<Vehiculo | null>(null)

  //! =================== Métodos CRUD ===================
   async agregarVehiculo(vhcl: Vehiculo)
   {
    const identificador = crypto.randomUUID();
    const vehiculoInsert: Vehiculo = {
      ...vhcl,
      uid: identificador,
      propietario: undefined,
      nombrePropietario: undefined,
      imagenes: undefined,
    }
    const imagenes = vhcl.imagenes ?? [];

    await this.sbSvc.insertar('Vehiculos', vehiculoInsert)

    if(imagenes.length != 0){
      const listaImagenes = await this.sbSvc.subirImagen(identificador,imagenes,'fotos-vehiculos');
      
      const dataImagenes: {url: string, uid_vehiculo: string}[] = (listaImagenes as string[]).map(
        (img)=>({
          url: img, uid_vehiculo: identificador
        })
      );
      await Promise.all(
        dataImagenes.map((img) =>{
          this.sbSvc.insertar('Fotos_vehiculos',img);
        })
      )
    }

    this.vehiculoSeleccionado.set(null);

  }
   async actualizarVehiculo(vhcl: Vehiculo){

    const vehiculo: Vehiculo = {
      ...vhcl,
      propietario: undefined,
      nombrePropietario: undefined,
      imagenes: undefined,
    }

    await this.sbSvc.actualizar('Vehiculos', 'uid', vehiculo.uid!, vehiculo)

    const imagenesActuales = this.vehiculoSeleccionado()?.imagenes!
    const imagenesNuevas = vhcl.imagenes ?? [];

    const imagenesEliminadas = imagenesActuales.filter((img)=>{
        !imagenesNuevas?.includes(img)
    })


    const listaImagenesTotal = await this.sbSvc.subirImagen(vhcl.uid!,imagenesNuevas!,'fotos-vehiculos');
    console.log(vehiculo.uid)
    const dataImagenes: {url: string, uid_vehiculo: string}[] = (listaImagenesTotal as string[]).map(
      (img)=>({
        url: img, uid_vehiculo: vehiculo.uid!
      })
    );

    console.log(JSON.stringify(dataImagenes,null,''))
    const dataImagenesNuevas = dataImagenes.filter(img =>
      !imagenesActuales.includes(img.url)
    );

    if(dataImagenesNuevas.length != 0){
      await Promise.all(
        dataImagenesNuevas.map((img) =>{
          this.sbSvc.insertar('Fotos_vehiculos',img);
        })
      )
    }

        if (imagenesEliminadas.length !== 0) {

      const eliminarBD = imagenesEliminadas.map(img =>
        this.sbSvc.eliminar('Fotos_vehiculos', 'url', img)
      );

      const eliminarStorage = imagenesEliminadas.map((url) => {
        const nombreArchivo = url.split('/').pop()?.split('.')[0] ?? '';
        return this.sbSvc.eliminarFoto('fotos-vehiculos', nombreArchivo);
      });

      await Promise.all([...eliminarBD, ...eliminarStorage]);
    }

  }

   async eliminarVehiculo(vhcl: Vehiculo){
    const imagenes = vhcl.imagenes ?? []
    await this.sbSvc.eliminar('Vehiculos','uid',vhcl.uid!);

    for (let i = 0; i < imagenes.length; i++) {
      await this.sbSvc.eliminarFoto('fotos-vehiculos',`${vhcl.uid}-${i}`);
    }
  }

  obtenerVehiculo(uid: string){
    return this.listaVehiculos().find((v)=> v.uid === uid) ?? null;
  }


  
  //! =================== Métodos en Tiempo Real ===================
  async iniciarCanalVehiculos() {
    if (this.isCanalInicializado) return;
    await this.recargarListado();
    this.isCanalInicializado = true;
    this.canalVehiculos!
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Vehiculos'
        },
        async (evento) => {
          console.log('Evento realtime recibido:', evento);

          switch (evento.eventType) {
            case 'INSERT':
              setTimeout(async()=> {
                  await this.recargarListado();
              }, 1000);
              break;

            case 'UPDATE':
              await this.recargarListado();
              break;

            case 'DELETE':
              await this.recargarListado();
              break;
          }
        }
      )
      .subscribe((status) => {
        console.log("Estado canal realtime VEHICULOS:", status);
      });
  }

  destruirCanalVehiculos() {
    if (this.canalVehiculos) {
      this.sbSvc.sb.removeChannel(this.canalVehiculos);
      this.canalVehiculos = null;
    }
  }
  //! =================== Métodos privados ===================
  private async recargarListado(){
    const relaciones: string[] = ['propietario: Usuarios(*)',
        'imagenes: Fotos_vehiculos(url)'
    ]

    const listaBD = await this.sbSvc.listarTodosConRelaciones<Vehiculo>('Vehiculos',relaciones);
    const vehiculos = listaBD.map((v)=>({
      ...v,
      nombrePropietario: `${(v as any).propietario.nombre} ${(v as any).propietario.apellido}`,
      propietario: (v as any).propietario as Usuario,
      imagenes: (v as any).imagenes?.map((img: any) => img.url) ?? []
    }))
    this.listaVehiculos.set(vehiculos);
  }


}
