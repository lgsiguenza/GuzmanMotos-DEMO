import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonText, IonCol, IonRow } from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/componentes/elementos/header/header.component";

interface Item {
  title: string;
  descr: string;
  pic: string;
}

@Component({
  selector: 'app-sobre-nos',
  templateUrl: './sobre-nos.page.html',
  styleUrls: ['./sobre-nos.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, HeaderComponent, IonText, IonTitle, IonCol, IonRow]
})
export class SobreNosPage implements OnInit {
  arr: Item[] = [
    { title: 'Moto Rodado 300', descr: 'Maxime vero sunt consequatur nemo', pic: 'assets/sobre-nos-imagenes/moto300.jpg' },
    { title: 'Moto Scooter', descr: 'Dolorum consequuntur at commodi', pic: 'assets/sobre-nos-imagenes/moto-scooter.jpg' },
    { title: 'Cuatriciclo pesado', descr: 'Ut fuga facere tempore iste', pic: 'assets/sobre-nos-imagenes/cuatricicloPesado.jpg' },
  ];

  constructor() { }

  ngOnInit() {
  }

}
