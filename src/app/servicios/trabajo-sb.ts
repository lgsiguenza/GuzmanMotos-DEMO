import { inject, Injectable, signal } from '@angular/core';
import { SbService } from './sb-service';
import { Trabajo } from '../models/trabajo';
import { Arreglo } from '../models/arreglo';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Vehiculo } from '../models/vehiculo';
import { Usuario } from '../models/usuario';

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
  trabajoSeleccionado = signal<Trabajo | null>(null);
  listaArreglos = signal<Arreglo[]>([]);

  //! =================== Métodos CRUD ===================
  
  async agregarTrabajo(tbj: Trabajo)
   {
    const identificador = crypto.randomUUID();
    const tbjInsert: Trabajo = {
      ...tbj,
      uid: identificador,
      arreglos: undefined,
      imagenes: undefined,
      vehiculo: undefined,
    }
    const arreglos = tbj.arreglos!.map((ar) => ({
      ...ar,
      uid_trabajo: tbjInsert.uid,
    }));
    
    const imagenes = tbj.imagenes ?? []
    
    
    
    await this.sbSvc.insertar('Trabajos', tbjInsert)
    await Promise.all(
      arreglos.map(ar => this.insertarArreglo(ar))
    );

    if(imagenes.length != 0){
      const listaImagenes = await this.sbSvc.subirImagen(identificador,imagenes,'fotos-trabajo');
      
      const dataImagenes: {url: string, uid_trabajo: string}[] = (listaImagenes as string[]).map(
        (img)=>({
          url: img, uid_trabajo: identificador
        })
      );
      await Promise.all(
        dataImagenes.map((img) =>{
          this.sbSvc.insertar('Fotos_trabajos',img);
        })
      )
    }


  }

  
  async actualizarTrabajo(tbj: Trabajo){

    const trabajoUpdate: any = {
      ...tbj,
      arreglos: undefined,
      vehiculo: undefined,
      imagenes: undefined,
      fotos: undefined,
    };

    await this.sbSvc.actualizar('Trabajos', 'uid', tbj.uid!, trabajoUpdate);

    //? =================== Imágenes ===================

    const limpiarUrl = (url: string) => url.split('?')[0];

    const imagenesActuales = (this.trabajoSeleccionado()?.imagenes ?? []).map(limpiarUrl);
    const imagenesNuevas = tbj.imagenes ?? [];

    //? 🔹 1. Procesar imágenes (manteniendo índice)
    const listaImagenesTotal = await Promise.all(
      imagenesNuevas.map(async (img, i) => {

        // Caso base64 → subir
        if (img.startsWith('data:')) {
          return await this.sbSvc.subirImagen(`${tbj.uid}-${i}`, img, 'fotos-trabajo');
        }

        // Caso URL → limpiar (por si viene con ?t=...)
        return limpiarUrl(img);
      })
    );

    //? 🔹 2. Detectar nuevas para insertar en BD
    const dataImagenes = listaImagenesTotal.map((url, idx:number | undefined) => ({
      url,
      uid_trabajo: tbj.uid!,
      idx
    }));

    const dataImagenesNuevas = dataImagenes.filter(img =>
      !imagenesActuales.includes(img.url as string)
    );

    if(dataImagenesNuevas.length !== 0){
      await Promise.all(
        dataImagenesNuevas.map(img =>{
          img.idx = undefined
          this.sbSvc.insertar('Fotos_trabajos', img)}
        )
      );
    }

    //? 🔹 3. Detectar eliminadas
    const imagenesEliminadas = imagenesActuales.filter(imgActual =>
      !listaImagenesTotal.some(imgNueva => limpiarUrl(imgNueva as string) === imgActual)
    );

    if (imagenesEliminadas.length !== 0) {

      const eliminarBD = imagenesEliminadas.map(url =>
        this.sbSvc.eliminar('Fotos_trabajos', 'url', url)
      );

      const eliminarStorage = imagenesEliminadas.map((url) => {
        const nombreArchivo = url.split('/').pop()?.split('.')[0] ?? '';
        return this.sbSvc.eliminarFoto('fotos-trabajo', nombreArchivo);
      });

      await Promise.all([...eliminarBD, ...eliminarStorage]);
    }

  }

   async eliminarTrabajo(tbj: Trabajo){
    const imagenes = tbj.imagenes ?? []
    await this.sbSvc.eliminar('Trabajos','uid',tbj.uid!);

    for (let i = 0; i < imagenes.length; i++) {
      await this.sbSvc.eliminarFoto('fotos-trabajo',`${tbj.uid}-${i}`);
    }

  }

  private async insertarArreglo(arreglo: Arreglo){
    console.log('Estamos en esta')
    await this.sbSvc.insertar('Arreglos', arreglo);
  }
  private async actualizarArreglo(arreglo: Arreglo){
    const arregloRepetido = this.listaArreglos()
      .find((arr) => arreglo.id === arr.id)

    if(arregloRepetido) await this.sbSvc.actualizar('Arreglos','id',String(arreglo.id!),arreglo);
    else this.sbSvc.insertar('Arreglos', arreglo);
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
          table: 'Trabajos'
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
    this.canalTrabajos!
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Arreglos'
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
        console.log("Estado canal realtime TRABAJOS:", status);
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
    const relaciones = [
      'arreglos: Arreglos(*)',
      'vehiculo: Vehiculos(*, usuario: Usuarios(*), fotos: Fotos_vehiculos(url))',
      'imagenes: Fotos_trabajos(url)'  
    ];

    const lsTbj = await this.sbSvc.listarTodosConRelaciones<Trabajo>('Trabajos', relaciones);

    const listaTrabajos = lsTbj.map((tb: any) => {
      const vehiculoDB = tb.vehiculo;

      const vehiculo: Vehiculo = {
        ...(vehiculoDB as Vehiculo),
        propietario: vehiculoDB.usuario as Usuario,
        nombrePropietario: `${vehiculoDB.usuario.nombre} ${vehiculoDB.usuario.apellido}`,
        imagenes: (tb.imagenes ?? []).map((ft: any) => {
          return ft.url ? `${ft.url}?t=${Date.now()}` : '';
        })
      };

      return {
        ...tb,
        vehiculo,
        arreglos: (tb.arreglos ?? []).map((a: any) => a as Arreglo),
        imagenes: (tb.imagenes ?? []).map((ft: any) => {
          return ft.url ? `${ft.url}?t=${Date.now()}` : '';
        })      
      };

    });

    this.listaTrabajos.set(listaTrabajos);
  }



}
