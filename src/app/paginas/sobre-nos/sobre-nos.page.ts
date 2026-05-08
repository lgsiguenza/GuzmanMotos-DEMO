import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonText, IonCol, IonRow, IonIcon, IonButton } from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/componentes/elementos/header/header.component";
import { addIcons } from 'ionicons';
import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';

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
  imports: [IonButton, IonIcon, IonContent, CommonModule, FormsModule, HeaderComponent, IonText, IonCol, IonRow]
})
export class SobreNosPage implements OnInit {
  @ViewChild('carousel') carousel!: ElementRef<HTMLDivElement>;


  arr: Item[] = [
    { title: 'KTM 390 Adventure', descr: 'Ut fuga facere tempore iste', pic: 'assets/sobre-nos-imagenes/Moto 6.jpeg' },
    { title: 'Yamaha Raptor 700R', descr: 'Maxime vero sunt consequatur nemo', pic: 'assets/sobre-nos-imagenes/Cuatriciclo 1.jpeg' },
    { title: 'Honda Falcon 400', descr: 'Dolorum consequuntur at commodi', pic: 'assets/sobre-nos-imagenes/Moto 1.jpeg' },
    { title: ' Segway Fugleman UT10', descr: 'Ut fuga facere tempore iste', pic: 'assets/sobre-nos-imagenes/Cortadora de pasto 1.jpeg' },
    { title: '', descr: 'Ut fuga facere tempore iste', pic: 'assets/sobre-nos-imagenes/Reparacion 1.jpeg' },
    { title: '', descr: 'Ut fuga facere tempore iste', pic: 'assets/sobre-nos-imagenes/Cuatriciclo 2.jpeg' },
    { title: 'Honda TRX 500', descr: 'Ut fuga facere tempore iste', pic: 'assets/sobre-nos-imagenes/Cuatriciclo 3.jpeg' },
    { title: 'Yamaha Grizzly 350', descr: 'Ut fuga facere tempore iste', pic: 'assets/sobre-nos-imagenes/Cuatriciclo 4.jpeg' },
    { title: 'Honda CRF230F', descr: 'Ut fuga facere tempore iste', pic: 'assets/sobre-nos-imagenes/Moto 2.jpeg' },
    { title: 'Yamaha Virago XV1100 ', descr: 'Ut fuga facere tempore iste', pic: 'assets/sobre-nos-imagenes/Moto 3.jpeg' },
    { title: '', descr: 'Ut fuga facere tempore iste', pic: 'assets/sobre-nos-imagenes/Reparacion 2.jpeg' },
    { title: 'Beta RR 450', descr: 'Ut fuga facere tempore iste', pic: 'assets/sobre-nos-imagenes/Moto 5.jpeg' },
    { title: 'P. Sportsman Touring 570', descr: 'Ut fuga facere tempore iste', pic: 'assets/sobre-nos-imagenes/Cuatriciclo 5.jpeg' },
    { title: 'Zontes T350 X', descr: 'Ut fuga facere tempore iste', pic: 'assets/sobre-nos-imagenes/Moto 7.jpeg' },
    { title: '', descr: 'Ut fuga facere tempore iste', pic: 'assets/sobre-nos-imagenes/Reparación 5.jpeg' },
    { title: 'Yamaha XTZ 250', descr: 'Ut fuga facere tempore iste', pic: 'assets/sobre-nos-imagenes/Moto 8.jpeg' },
  ];

    scrollTeaser(direction: 'left' | 'right'){

    const container = this.carousel.nativeElement;

    const amount = 300;

    container.scrollBy({
      left: direction === 'right' ? amount : -amount,
      behavior: 'smooth'
    });

  }

  constructor() {
    addIcons({chevronBackOutline,chevronForwardOutline});
   }

  ngOnInit() {
  }

}
