import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonButton, IonIcon, ModalController } from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/componentes/elementos/header/header.component";
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { buildOutline, carSportOutline, clipboardOutline, constructOutline, handLeftOutline, handRightOutline } from 'ionicons/icons';
import { Utils } from 'src/app/servicios/utils';
import { FormularioAltaTrabajoModalComponent } from 'src/app/componentes/elementos/modales/formulario-alta-trabajo-modal/formulario-alta-trabajo-modal.component';
import { FormularioAltaVehiculoModalComponent } from 'src/app/componentes/elementos/modales/formulario-alta-vehiculo-modal/formulario-alta-vehiculo-modal.component';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.page.html',
  styleUrls: ['./cliente.page.scss'],
  standalone: true,
  imports: [IonIcon, IonContent, CommonModule, FormsModule, HeaderComponent, IonButton, RouterLink]
})
export class ClientePage implements OnInit {

  private modalCtrl = inject(ModalController);
  private utilSvc = inject(Utils);

  constructor() {
    addIcons({handLeftOutline,handRightOutline, carSportOutline,
      clipboardOutline,constructOutline, buildOutline});
   }

  ngOnInit() {
  }

  async abrirReparacion(){
    await this.utilSvc.crearModal(FormularioAltaTrabajoModalComponent,'md',{},true)
  }  

  async abrirRegistroVehicular(){
    await this.utilSvc.crearModal(FormularioAltaVehiculoModalComponent, 'md', {}, true)
  }

}
