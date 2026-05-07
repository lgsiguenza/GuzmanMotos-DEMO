import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { IonGrid, IonRow, IonCol, ModalController, IonText, IonLabel, IonContent, IonFooter } from '@ionic/angular/standalone';
import { ModalFooterComponent } from "../modal-footer/modal-footer.component";
import { Utils } from 'src/app/servicios/utils';
import { UsuarioSb } from 'src/app/servicios/usuario-sb';
import { LgsInputComponent } from "../../lgs-input/lgs-input.component";
import { Usuario } from 'src/app/models/usuario';

@Component({
  selector: 'app-registro',
  templateUrl: './registro-modal.component.html',
  styleUrls: ['./registro-modal.component.scss'],
  standalone: true,
  imports: [IonLabel, IonCol, IonRow, IonGrid,
    CommonModule, FormsModule, ModalFooterComponent, LgsInputComponent, IonText, IonContent, IonFooter]
})
export class RegistroModalComponent{

  //! =============== Variables y servicios ===============
  private utilSvc = inject(Utils);
  private userSvc = inject(UsuarioSb);
  private modalCtrl = inject(ModalController);


  //~ =============== Formulario
  protected form = new FormGroup({
    nombre: new FormControl('', [Validators.required,Validators.minLength(3),
      Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/),]),
    apellido: new FormControl('', [Validators.required,Validators.minLength(3),
      Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/),]),
    documento: new FormControl('', [Validators.required,Validators.minLength(7),
      Validators.maxLength(8),Validators.pattern(/^\d{7,8}$/),]),
    correo: new FormControl('', [Validators.required,Validators.email,
      Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),]),
    telefono: new FormControl('',[Validators.min(1000000000), Validators.required]),
    contrasenia: new FormControl('', [Validators.required,Validators.minLength(8),]),
    repetirContrasenia: new FormControl('', [Validators.required, this.matchPassword]),
  });

  matchPassword(control: AbstractControl) {
    if (!control.parent) return null;

    const pass = control.parent.get('contrasenia')?.value;
    const confirm = control.value;

    return pass === confirm ? null : { notSame: true };
  }
  
  //! =============== Métodos funcionales ===============

  async cerrarModal(){
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  async registrar(){
    if(this.form.invalid){
      this.form.markAllAsTouched();
      this.utilSvc.mostrarToast('¡Debe rellenar todos los campos correctamente', 'error','middle',500)
      return
    }

    const usr: Usuario = {
      apellido: this.form.controls.apellido.value!,
      correo: this.form.controls.correo.value!,
      dni: this.form.controls.documento.value!,
      nombre: this.form.controls.nombre.value!,
      telefono: this.form.controls.telefono.value!,
      contraseña: this.form.controls.contrasenia.value!,
      rol: 'cliente',
    }
    const carga = await this.utilSvc.loading()
    await carga.present();
    try{
      await this.userSvc.agregarUsuario(usr);      
    }catch(e){
      e = e as Error;
      await this.utilSvc.mostrarToast("¡Ha ocurrido un error!",'error','middle',500);
    }

    await carga.dismiss();
    return this.modalCtrl.dismiss(null, 'confirm')

  }
}
