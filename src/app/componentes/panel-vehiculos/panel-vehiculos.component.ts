import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { addIcons } from 'ionicons';
import { addOutline, apertureOutline, buildOutline, chevronBackOutline, chevronForwardOutline, cloudOfflineOutline, constructOutline, trashOutline } from 'ionicons/icons';
import { Vehiculo } from 'src/app/models/vehiculo';
import { Utils } from 'src/app/servicios/utils';
import { VehiculoSb } from 'src/app/servicios/vehiculo-sb';
import { IonButton, IonButtons, IonCard, IonCardTitle, IonCardHeader, IonCardContent, 
  ModalController, IonIcon, IonText, IonSegment, IonSegmentButton, IonLabel, IonCol, IonRow } from '@ionic/angular/standalone';
import { FormularioAltaVehiculoModalComponent } from '../elementos/modales/formulario-alta-vehiculo-modal/formulario-alta-vehiculo-modal.component';
import { CommonModule } from '@angular/common';
import { LgsCarruselComponent } from "../elementos/lgs-carrusel/lgs-carrusel.component";

@Component({
  selector: 'app-panel-vehiculos',
  templateUrl: './panel-vehiculos.component.html',
  styleUrls: ['./panel-vehiculos.component.scss'],
  imports: [IonIcon, IonCardContent,
    IonCardHeader, IonCardTitle, IonCard, IonButton, CommonModule, IonCol, IonRow, IonText, LgsCarruselComponent]})
export class PanelVehiculosComponent  implements OnInit {

//! =================== Servicios y variables ===================
  private vehiculoSvc = inject(VehiculoSb);
  private utilSvc = inject(Utils);

  //! =================== Métodos visuales / Paginación ===================
  //~ =================== Paginación
  listaFiltrada = computed(() =>
    (this.vehiculoSvc.listaVehiculos() ?? [])
      .sort((a, b) => a.id! - b.id!)
  );

    //* ✅ Señal para la página actual
  page = signal(1);
    pageSize = computed(()=>{
      switch(this.listaFiltrada().length){
        case 1: 
          return 1;
        case 2:
          return 2;
        default: 
          return 2;
      }
    }); 
    
    //* ✅ Lista paginada derivada de la lista filtrada
    get paginatedItems(): Vehiculo[] {
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


  constructor() {
    addIcons({chevronForwardOutline, chevronBackOutline,
      addOutline, buildOutline, apertureOutline, trashOutline,
      constructOutline, cloudOfflineOutline})
    }
  async ngOnInit() {
    await this.vehiculoSvc.iniciarCanalVehiculos()
  }
    
  //! =================== Métodos funcionales ===================
   async eliminar(vehiculo: Vehiculo) {
    const carga = await this.utilSvc.loading()
    await carga.present();
    try{
      this.vehiculoSvc.eliminarVehiculo(vehiculo)
      if(this.page() != 1) this.prevPage();

      await this.utilSvc.mostrarToast('Vehículo eliminado con éxito.', 'info','middle',1000)
    } catch(e){
      await this.utilSvc.mostrarToast('Algo salió mal.', 'error','middle',100)
    } finally{
      await carga.dismiss();
    }
  }

  async abrirFormularioNuevo(){
    const modal = await this.utilSvc.crearModal(FormularioAltaVehiculoModalComponent, 
      'md',{isEdicion: false},true)
    
    const {data, role} = await modal.onDidDismiss<Vehiculo>();
    
    if(role === 'confirm'){
      this.utilSvc.mostrarToast("¡Vehículo agregado exitosamente!", 'success','middle',500);
    }
    if(role === 'cancel'){
      this.utilSvc.mostrarToast("Acción cancelada", 'error','middle',100);
    }
    
  }
  
  async abrirFormularioEdicion(vehiculo: Vehiculo){
    const vehiculoSignal = signal<Vehiculo>(vehiculo)
    const modal = await this.utilSvc.crearModal(FormularioAltaVehiculoModalComponent, '',
      {isEdicion: true, vehiculoEditado: vehiculoSignal},true)
    
  }

  async verDetalles(usr: Vehiculo){
  
  }
}
