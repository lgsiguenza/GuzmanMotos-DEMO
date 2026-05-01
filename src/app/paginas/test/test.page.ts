import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonRow, IonImg, IonButton, IonIcon, IonCol, IonGrid, IonFooter, IonButtons, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { LgsInputComponent } from "src/app/componentes/elementos/lgs-input/lgs-input.component";
import { addIcons } from 'ionicons';
import { addCircle, addOutline, cameraOutline } from 'ionicons/icons';
import { UsuarioSb } from 'src/app/servicios/usuario-sb';
import { LgsDesplegableComponent } from "src/app/componentes/elementos/lgs-desplegable/lgs-desplegable.component";
import { Utils } from 'src/app/servicios/utils';
import { RegistroModalComponent } from 'src/app/componentes/elementos/modales/registro-modal/registro-modal.component';
import { FormularioAltaVehiculoModalComponent } from "src/app/componentes/elementos/modales/formulario-alta-vehiculo-modal/formulario-alta-vehiculo-modal.component";

@Component({
  selector: 'app-test',
  templateUrl: './test.page.html',
  styleUrls: ['./test.page.scss'],
  standalone: true,
  imports: [FormularioAltaVehiculoModalComponent, IonContent],
})
export class TestPage implements OnInit {

  private utilSvc = inject(Utils);

  constructor() {
    addIcons({cameraOutline,addCircle});
  }

  async ngOnInit() {
  }

}
