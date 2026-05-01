import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonContent, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonButton, ModalController } from "@ionic/angular/standalone";
import { LgsInputComponent } from '../../lgs-input/lgs-input.component';
import { Utils } from 'src/app/servicios/utils';
import { UsuarioSb } from 'src/app/servicios/usuario-sb';
import { ModalFooterComponent } from "../modal-footer/modal-footer.component";

@Component({
  selector: 'app-ingreso-modal',
  templateUrl: './ingreso-modal.component.html',
  styleUrls: ['./ingreso-modal.component.scss'],
imports: [IonButton, IonCardContent, IonCardTitle, IonCardHeader,
    IonCard, ReactiveFormsModule, CommonModule, FormsModule,
     LgsInputComponent, ModalFooterComponent],})
    
export class IngresoModalComponent {
 //! =============== Form ===============

   protected form = new FormGroup({
    correo: new FormControl('', [Validators.required, Validators.email]),
    contrasenia: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  //! =============== Servicios ===============  
  private utilSvc = inject(Utils);
  private userSvc = inject(UsuarioSb);
  private modalCrtl = inject(ModalController);


  //! =============== Métodos funcionales ===============
   autocompletar(correo: string, password: string)
  {
    return this.form.setValue({
    correo: correo,
    contrasenia: password
    })
  }

  async ingresar(){
    if(this.form.invalid){
      this.form.markAllAsTouched();
      this.utilSvc.mostrarToast('¡Debe rellenar todos los campos correctamente', 'error','middle',500)
      return
    }
    const {correo, contrasenia } ={
      correo: this.form.controls.correo.value!,
      contrasenia: this.form.controls.contrasenia.value!
    }

    const carga = await this.utilSvc.loading()
    await carga.present();
    try{
      await this.userSvc.iniciarSesion(correo, contrasenia);
      await this.utilSvc.redirigir('/control');      
    }catch(e){
      await this.utilSvc.mostrarAlert("¡Ha ocurrido un error!", (e as Error).message);
    }

    await carga.dismiss();
    
    return this.modalCrtl.dismiss(null, 'confirm')

  }
  

  async cerrar(){
    await this.modalCrtl.dismiss(null, 'cancel')
  }
}
