import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/componentes/elementos/header/header.component";
import { PanelTrabajosComponent } from "src/app/componentes/panel-trabajos/panel-trabajos.component";

@Component({
  selector: 'app-panel-reparaciones-cliente',
  templateUrl: './panel-reparaciones-cliente.page.html',
  styleUrls: ['./panel-reparaciones-cliente.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule,
    HeaderComponent, PanelTrabajosComponent]
})
export class PanelReparacionesClientePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
