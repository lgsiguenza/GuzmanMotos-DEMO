import { CommonModule } from '@angular/common';
import { Component, computed, inject, Input, signal } from '@angular/core';
import { IonButton, IonButtons, IonCard, IonCardTitle, IonCardHeader, IonCardContent, ModalController, IonIcon, IonText, IonSegment, IonSegmentButton, IonLabel, IonCol, IonRow } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, apertureOutline, bagCheckOutline, buildOutline, caretUpOutline, chevronBackOutline, chevronForwardOutline, cloudOffline, cloudOfflineOutline, constructOutline, trashOutline } from 'ionicons/icons';
import { Trabajo } from 'src/app/models/trabajo';
import { TrabajoSb } from 'src/app/servicios/trabajo-sb';
import { Utils } from 'src/app/servicios/utils';
import { FormularioAltaTrabajoModalComponent } from '../elementos/modales/formulario-alta-trabajo-modal/formulario-alta-trabajo-modal.component';
import { FormatoFechaPipe } from 'src/app/pipes/formato-fecha-pipe';
import { DetallesActualizacionTrabajoModalComponent } from '../elementos/modales/detalles-actualizacion-trabajo-modal/detalles-actualizacion-trabajo-modal.component';
import { LgsCarruselComponent } from "../elementos/lgs-carrusel/lgs-carrusel.component";

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

  filtro = signal<'completado'|'en proceso'|'solicitado'|'sin filtro'>('sin filtro') 

  constructor() {
    addIcons({chevronForwardOutline, chevronBackOutline,
      addOutline, buildOutline, apertureOutline, trashOutline,
      constructOutline, cloudOfflineOutline, bagCheckOutline, caretUpOutline})
    }
  async ngOnInit() {
    await this.tbjSvc.iniciarCanalTrabajos()
  }
  //! =================== Métodos visuales / Paginación ===================
  //~ =================== Paginación
  listaFiltrada = computed(() =>{
    const ls = (this.tbjSvc.listaTrabajos() ?? [])
      .sort((a, b) => a.id! - b.id!)

      if(this.filtro() === 'sin filtro') return ls
      else return ls.filter((tbj) => tbj.estado === this.filtro())
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
   async completarTrabajo(usr: Trabajo) {

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
