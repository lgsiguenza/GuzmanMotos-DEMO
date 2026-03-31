import { CommonModule } from '@angular/common';
import { Component, computed, inject, Input, signal } from '@angular/core';
import { IonButton, IonButtons, IonCard, IonCardTitle, IonCardHeader, IonCardContent, ModalController, IonIcon, IonText, IonSegment, IonSegmentButton, IonLabel, IonCol, IonRow } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, apertureOutline, buildOutline, chevronBackOutline, chevronForwardOutline, constructOutline, trashOutline } from 'ionicons/icons';
import { Trabajo } from 'src/app/models/trabajo';
import { TrabajoSb } from 'src/app/servicios/trabajo-sb';
import { Utils } from 'src/app/servicios/utils';
import { FormularioAltaTrabajoModalComponent } from '../elmentos/modales/formulario-alta-trabajo-modal/formulario-alta-trabajo-modal.component';
import { FormatoFechaPipe } from 'src/app/pipes/formato-fecha-pipe';
import { DetallesActualizacionTrabajoModalComponent } from '../elmentos/modales/detalles-actualizacion-trabajo-modal/detalles-actualizacion-trabajo-modal.component';

@Component({
  selector: 'app-panel-trabajos',
  templateUrl: './panel-trabajos.component.html',
  styleUrls: ['./panel-trabajos.component.scss'],
  imports: [IonLabel, IonSegmentButton, IonSegment, IonIcon, IonCardContent,
    IonCardHeader, IonCardTitle, IonCard, IonButton, CommonModule, IonCol, FormatoFechaPipe, IonButtons]
  })
export class PanelTrabajosComponent {
  //! =================== Servicios y variables ===================
  private tbjSvc = inject(TrabajoSb);
  private utilSvc = inject(Utils);

  //! =================== Métodos visuales / Paginación ===================
  //~ =================== Paginación
  listaFiltrada = computed(() =>
    (this.tbjSvc.listaTrabajos() ?? [])
      .sort((a, b) => a.id! - b.id!)
  );

    //* ✅ Señal para la página actual
  page = signal(1);
  pageSize = 3; 
  
  //* ✅ Lista paginada derivada de la lista filtrada
  get paginatedItems(): Trabajo[] {
    const start = (this.page() - 1) * this.pageSize;
    return this.listaFiltrada().slice(start, start + this.pageSize);
  }

  totalPages(): number {
    return Math.ceil(this.listaFiltrada().length / this.pageSize);
  }

  nextPage() {
    if (this.page() < this.totalPages()) this.page.set(this.page() + 1);
  }

  prevPage() {
    if (this.page() > 1) this.page.set(this.page() - 1);
  }


  constructor() {
    addIcons({chevronForwardOutline, chevronBackOutline,
      addOutline, buildOutline, apertureOutline, trashOutline, constructOutline})
    }
  async ngOnInit() {
    await this.tbjSvc.iniciarCanalTrabajos()
  }
    
  //! =================== Métodos funcionales ===================
   async eliminarUsuario(usr: Trabajo) {

  }

  async abrirFormularioNuevo(){
    const modal = await this.utilSvc.crearModal(FormularioAltaTrabajoModalComponent, 'lg',{isEdicion: false},true)
    const {data, role} = await modal.onDidDismiss<Trabajo>();

    if(role === 'confirm'){
        this.utilSvc.mostrarToast("¡Usuario agregado exitosamente!", 'success','middle',500);
      } else{
        this.utilSvc.mostrarToast("Acción cancelada.", 'primary','middle',100);
    }
    
  }

  async abrirFormularioEdicion(tbj: Trabajo){
    const modal = await this.utilSvc.crearModal(FormularioAltaTrabajoModalComponent, 'lg',{isEdicion: true, trabajoActualización: tbj },true)
    const {data, role} = await modal.onDidDismiss<Trabajo>();

    if(role === 'confirm'){
        this.utilSvc.mostrarToast("¡Usuario agregado exitosamente!", 'success','middle',500);
      } else{
        this.utilSvc.mostrarToast("Acción cancelada.", 'primary','middle',100);
    }  
  }

  async verDetalles(tbj: Trabajo){
    const modal = await this.utilSvc.crearModal(DetallesActualizacionTrabajoModalComponent, 'lg',{tbj: tbj},true);
    const {data, role} = await modal.onDidDismiss();
  }

}
