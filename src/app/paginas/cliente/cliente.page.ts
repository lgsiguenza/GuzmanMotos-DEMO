import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonCol, IonRow, IonButton, IonButtons, IonGrid } from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/componentes/elementos/header/header.component";

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.page.html',
  styleUrls: ['./cliente.page.scss'],
  standalone: true,
  imports: [IonGrid, IonButtons, IonContent,
    CommonModule, FormsModule,
    HeaderComponent, IonCol, IonRow, IonButton]
})
export class ClientePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
