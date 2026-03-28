import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';
import { Utils } from 'src/app/servicios/utils';

@Component({
  selector: 'app-prelogin',
  templateUrl: './prelogin.page.html',
  styleUrls: ['./prelogin.page.scss'],
  standalone: true,
  imports: [IonCol, IonRow, IonGrid, IonContent, CommonModule]
})
export class PreloginPage implements OnInit {

 
  private noise: HTMLAudioElement | null = null;
  private utilSvc = inject(Utils);

    
  ionViewWillEnter() {
    if (this.noise != null)
      {
        this.noise.play();      
      }
    setTimeout(() => {
      this.noise?.remove()
      {  
        return this.utilSvc.redirigir('/inicio',true); 
      }
    }, 3000);
  }

  async ngOnInit(): Promise<void>
  {
    this.utilSvc.reproducirSonidoPorDuracion('assets/sounds/drum.ogg',1000)
  }

  ngOnDestroy(): void {
    this.noise?.remove()
  }

}
