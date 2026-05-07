import { CommonModule } from '@angular/common';
import { Component, computed, inject, Input, signal } from '@angular/core';
import { IonButton, IonButtons, IonCard, IonCardTitle, 
  IonCardHeader, IonCardContent, IonIcon, IonText, IonSegment,
  IonSegmentButton, IonLabel, IonCol, IonRow, AlertController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, apertureOutline, bagCheckOutline, buildOutline, caretUpOutline, chevronBackOutline, chevronForwardOutline, cloudDownloadOutline, cloudOffline, cloudOfflineOutline, constructOutline, download, downloadOutline, logoWhatsapp, shareSocialOutline, trashOutline } from 'ionicons/icons';
import { Trabajo } from 'src/app/models/trabajo';
import { TrabajoSb } from 'src/app/servicios/trabajo-sb';
import { Utils } from 'src/app/servicios/utils';
import { FormularioAltaTrabajoModalComponent } from '../elementos/modales/formulario-alta-trabajo-modal/formulario-alta-trabajo-modal.component';
import { FormatoFechaPipe } from 'src/app/pipes/formato-fecha-pipe';
import { DetallesActualizacionTrabajoModalComponent } from '../elementos/modales/detalles-actualizacion-trabajo-modal/detalles-actualizacion-trabajo-modal.component';
import { LgsCarruselComponent } from "../elementos/lgs-carrusel/lgs-carrusel.component";
import { UsuarioSb } from 'src/app/servicios/usuario-sb';

@Component({
  selector: 'app-panel-trabajos',
  templateUrl: './panel-trabajos.component.html',
  styleUrls: ['./panel-trabajos.component.scss'],
  imports: [IonLabel, IonSegmentButton, IonSegment, IonIcon, IonCardContent,
    IonCardHeader, IonCardTitle, IonCard, IonButton, CommonModule, IonCol, FormatoFechaPipe, IonButtons, LgsCarruselComponent, IonText, IonRow]
  })
export class PanelTrabajosComponent {
  //! =================== Servicios y variables ===================
  private tbjSvc = inject(TrabajoSb);
  private utilSvc = inject(Utils);
  private usuarioSvc = inject(UsuarioSb);
  private alertCtrl = inject(AlertController);


  protected rolActual = computed(()=>
  {return this.usuarioSvc.usrActual()?.rol ?? 'cliente'})
  filtro = signal<'completado'|'en proceso'|'solicitado'|'sin filtro'>('sin filtro') 

  constructor() {
    addIcons({chevronForwardOutline, chevronBackOutline,
      addOutline, buildOutline, apertureOutline, trashOutline,
      constructOutline, cloudOfflineOutline, bagCheckOutline, caretUpOutline, 
      logoWhatsapp, shareSocialOutline})
    }
  async ngOnInit() {
    await this.tbjSvc.iniciarCanalTrabajos()
  }
  //! =================== Métodos visuales / Paginación ===================
  //~ =================== Paginación
  listaFiltrada = computed(() =>{
    let ls = (this.tbjSvc.listaTrabajos() ?? [])
      .sort((a, b) => a.id! - b.id!);

    if (this.usuarioSvc.usrActual()?.rol === 'cliente') {
      ls = ls.filter(
        (t) => t.vehiculo?.uid_propietario === this.usuarioSvc.usrActual()?.uid
      );
    }

    if (this.filtro() === 'sin filtro') return ls;
    else return ls.filter((tbj) => tbj.estado === this.filtro());
  });

  //* ✅ Señal para la página actual
  page = signal(1);
  pageSize = computed(()=>{
    switch(this.listaFiltrada().length){
      case 1: 
        return 1;
      case 2:
        return 2;
      default: 
        return 3;
    }
  }); 
  
  //* ✅ Lista paginada derivada de la lista filtrada
  get paginatedItems(): Trabajo[] {
    const start = (this.page() - 1) * this.pageSize();
    return this.listaFiltrada().slice(start, start + this.pageSize());
  }

  totalPages(): number {
    return Math.ceil(this.listaFiltrada().length / this.pageSize());
  }

  nextPage() {
    if (this.page() < this.totalPages()) this.page.set(this.page() + 1);
  }

  prevPage() {
    if (this.page() > 1) this.page.set(this.page() - 1);
  }


  
    
  //! =================== Métodos funcionales ===================
   async modificarTrabajo(trabajo: Trabajo, isPdf:boolean = false) {
    if(isPdf){
      alert("XD")
      return
    }

    const estado = trabajo.estado
    
    const carga = await this.utilSvc.loading()
    await carga.present();
    this.tbjSvc.trabajoSeleccionado.set(trabajo);
    try {
      switch(estado){
        case 'solicitado':
          await this.tbjSvc.actualizarTrabajo({...trabajo, estado: 'en proceso'});
          await this.utilSvc.mostrarToast('¡Reparación actualizada!', 'success','middle',200)
          break;
        case 'en proceso':
          if(trabajo.arreglos?.length === 0){
            await this.utilSvc.mostrarToast('No se puede completar hasta que se registren y completen reparaciones.', 'error','middle',1200) 
            return;
          }  

          const hayPendientes = trabajo.arreglos?.some((arr) => arr.estado !== 'completado');
          if(hayPendientes) {
            await this.utilSvc.mostrarToast('Aún hay reparaciones pendientes.', 'error','middle',1200)
            return;
          }
          const ahora = new Date();
          const fechaFormateada =
            ahora.getUTCFullYear() + '-' +
            String(ahora.getUTCMonth() + 1).padStart(2, '0') + '-' +
            String(ahora.getUTCDate()).padStart(2, '0') + ' ' +
            String(ahora.getUTCHours()).padStart(2, '0') + ':' +
            String(ahora.getUTCMinutes()).padStart(2, '0') + ':' +
            String(ahora.getUTCSeconds()).padStart(2, '0') + '.' +
            String(ahora.getUTCMilliseconds()).padStart(3, '0') +
            '+00';

          await this.tbjSvc.actualizarTrabajo({...trabajo, estado: 'completado', egreso: fechaFormateada});
          await this.utilSvc.mostrarToast('¡Reparación actualizada!', 'success','middle',200)
          break;
        case 'completado':
          await this.utilSvc.mostrarAlertConfirm({
            header: "Eliminar registro.",
            message: '¡Cuidado! Esta acción no se puede deshacer.',
            onAceptar: async() => {
              await carga.present();
              await this.tbjSvc.eliminarTrabajo(trabajo);
              await carga.dismiss();
            },
          })
          break;
        }
        
    } catch (e) {
        await this.utilSvc.mostrarToast('Algo salió mal...', 'error','middle',500)
    } finally{
      await carga.dismiss();
    }

  }

  enviarMensajeWhatapp(trabajo: Trabajo): string{
    const estado = trabajo.estado;
    const numeroCliente = trabajo.vehiculo?.propietario?.telefono
    const rol = this.rolActual();
    var mensaje: string;
    var link: string;

    if(rol === 'cliente'){
      switch (estado){
        case 'solicitado':
          mensaje = `Buenas, soy ${trabajo.vehiculo?.nombrePropietario}. Hice una solicitud de reparación en la plataforma. Aguardo tu respuesta.`
          break;
        case 'en proceso':
            mensaje = `Buenas, soy ${trabajo.vehiculo?.nombrePropietario}. Quisiera saber cómo viene la reparación de mi ${trabajo.vehiculo?.modelo}.`
            break;
        case 'completado':
            mensaje = `Buenas, soy ${trabajo.vehiculo?.nombrePropietario}. Quiero hablar sobre la reparación de mi ${trabajo.vehiculo?.modelo}.`
      } 

      link = `https://wa.me/5492281373142?text=${mensaje}`
    } else{
      switch (estado){
        case 'solicitado':
          mensaje = `Buenas, somos el equipo de Guzman Motos. Quisiera concretar una llamada al respecto de su solicitud en la plataforma.`
          break;
        case 'en proceso':
            mensaje = `Buenas, nos comunicamos desde Guzman Motos para pedirte revisar el progreso de tu ${trabajo.vehiculo?.modelo}.`
            break;
        case 'completado':
            mensaje = `Buenas, tu ${trabajo.vehiculo?.modelo} ya se encuentra listo para su retiro.`
      }
      link = `https://wa.me/${numeroCliente}?text=${mensaje}`
    }

    return link ?? this.utilSvc.mostrarAlert('¡Hubo un problema', 'No se pudo generar el link')

  }

  async abrirFormularioNuevo(){
    const modal = await this.utilSvc.crearModal(FormularioAltaTrabajoModalComponent, 'lg',{isEdicion: false},true)
    const {data, role} = await modal.onDidDismiss<Trabajo>();

    if(role === 'confirm'){
        this.utilSvc.mostrarToast("Trabajo registrado exitosamente!", 'success','middle',500);
      } else{
        this.utilSvc.mostrarToast("Acción cancelada.", 'primary','middle',100);
    }
    
  }

  async abrirFormularioEdicion(tbj: Trabajo){
    const modal = await this.utilSvc.crearModal(FormularioAltaTrabajoModalComponent, 'lg',
      {isEdicion: true, trabajoActualización: tbj },true);
    const {data, role} = await modal.onDidDismiss<Trabajo>();

    if(role === 'confirm'){
        this.utilSvc.mostrarToast("¡Trabajo actualizado exitosamente!", 'success','middle',500);
      } else{
        this.utilSvc.mostrarToast("Acción cancelada.", 'primary','middle',100);
    }  
  }

  async verDetalles(tbj: Trabajo){
    const modal = await this.utilSvc.crearModal(DetallesActualizacionTrabajoModalComponent, 'lg',{tbj: tbj},true);
    const {data, role} = await modal.onDidDismiss();
  }


  modificarFiltro(filtro: 'completado' | 'en proceso' | 'solicitado'){
    this.filtro.set(filtro);
  }
}
