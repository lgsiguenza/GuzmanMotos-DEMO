import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { addIcons } from 'ionicons';
import { addOutline, apertureOutline, buildOutline, chevronBackOutline, chevronForwardOutline, constructOutline, trashOutline } from 'ionicons/icons';
import { Vehiculo } from 'src/app/models/vehiculo';
import { Utils } from 'src/app/servicios/utils';
import { VehiculoSb } from 'src/app/servicios/vehiculo-sb';
import { IonButton, IonButtons, IonCard, IonCardTitle, IonCardHeader, IonCardContent, 
  ModalController, IonIcon, IonText, IonSegment, IonSegmentButton, IonLabel, IonCol, IonRow } from '@ionic/angular/standalone';
import { FormularioAltaVehiculoModalComponent } from '../elmentos/modales/formulario-alta-vehiculo-modal/formulario-alta-vehiculo-modal.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-panel-vehiculos',
  templateUrl: './panel-vehiculos.component.html',
  styleUrls: ['./panel-vehiculos.component.scss'],
  imports: [ IonIcon, IonCardContent,
     IonCardHeader, IonCardTitle, IonCard, IonButton, CommonModule, IonCol]})
export class PanelVehiculosComponent  implements OnInit {

//! =================== Servicios y variables ===================
  private vhclSvc = inject(VehiculoSb);
  private utilSvc = inject(Utils);

  //! =================== Métodos visuales / Paginación ===================
  //~ =================== Paginación
  listaFiltrada = computed(() =>
    (this.vhclSvc.listaVehiculos() ?? [])
      .sort((a, b) => a.id! - b.id!)
  );

    //* ✅ Señal para la página actual
  page = signal(1);
  pageSize = 1; 
  
  //* ✅ Lista paginada derivada de la lista filtrada
  get paginatedItems(): Vehiculo[] {
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
    await this.vhclSvc.iniciarCanalVehiculos()
  }
    
  //! =================== Métodos funcionales ===================
   async eliminarUsuario(usr: Vehiculo) {

  }

  async abrirFormularioNuevo(){
    const modal = await this.utilSvc.crearModal(FormularioAltaVehiculoModalComponent, 'sm',{},true)
    
    const {data, role} = await modal.onDidDismiss<Vehiculo>();

    if(role === 'confirm'){
        this.utilSvc.mostrarToast("¡Usuario agregado exitosamente!", 'success','middle',500);
    }
    
  }

  async abrirFormularioEdicion(usuario: Vehiculo){
  
  }

  async verDetalles(usr: Vehiculo){
  
  }
}
