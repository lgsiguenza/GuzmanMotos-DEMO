import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/componentes/elementos/header/header.component";
import { PanelVehiculosComponent } from "src/app/componentes/panel-vehiculos/panel-vehiculos.component";

@Component({
  selector: 'app-panel-vehiculos-cliente',
  templateUrl: './panel-vehiculos-cliente.page.html',
  styleUrls: ['./panel-vehiculos-cliente.page.scss'],
  standalone: true,
  imports: [IonContent,
     CommonModule, FormsModule, HeaderComponent, PanelVehiculosComponent]
})
export class PanelVehiculosClientePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
