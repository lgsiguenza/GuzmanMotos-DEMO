import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonSegment, IonSegmentButton, IonSegmentView, IonSegmentContent } from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/componentes/elmentos/header/header.component";
import { UsuarioSb } from 'src/app/servicios/usuario-sb';
import { PanelUsuarioComponent } from "src/app/componentes/panel-usuario/panel-usuario.component";
import { PanelVehiculosComponent } from "src/app/componentes/panel-vehiculos/panel-vehiculos.component";
import { PanelTrabajosComponent } from "src/app/componentes/panel-trabajos/panel-trabajos.component";

@Component({
  selector: 'app-control',
  templateUrl: './control.page.html',
  styleUrls: ['./control.page.scss'],
  standalone: true,
  imports: [IonSegmentButton, IonSegment, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, HeaderComponent, IonSegmentView, IonSegmentContent, PanelUsuarioComponent, PanelVehiculosComponent, PanelTrabajosComponent]
})
export class ControlPage implements OnInit {

  protected userSvc = inject(UsuarioSb);


  constructor() { }

  ngOnInit() {
  }

}
