import { TitleCasePipe } from '@angular/common';
import { Component, computed, inject, Input, input, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonSelect, IonSelectOption } from "@ionic/angular/standalone";
import { ModalController } from '@ionic/angular/standalone';
import { ListadoDesplegableComponent } from '../modales/listado-desplegable/listado-desplegable.component';


@Component({
  selector: 'app-lgs-desplegable',
  templateUrl: './lgs-desplegable.component.html',
  styleUrls: ['./lgs-desplegable.component.scss'],
  imports: [ReactiveFormsModule, FormsModule, TitleCasePipe],
})
export class LgsDesplegableComponent  implements OnInit {

  //! ====================== Inputs ======================
  label = input.required<string>()
  placeholder = input.required<string>()
  opciones = input.required<any[]>()
  control = input.required<FormControl>()
  mensajeValidacion = input<string>();
  @Input() deshabilitar:boolean = false;

  parametroNombre = input.required<string>() 
  parametroValor = input.required<string>() 
  parametroAdicional = input<string>()
  
  //! ====================== Propiedades privadas ======================
  private modalCtrl = inject(ModalController);
  
  
  protected listado = computed(()=>{
    return this.opciones();
  })
  
  constructor() { }

  ngOnInit() {
  }


  async abrirModal() {
    if (this.deshabilitar) return;

    const modal = await this.modalCtrl.create({
      component: ListadoDesplegableComponent,
      componentProps: {
        listado: this.listado,
        parametroNombre: this.parametroNombre,
        parametroOpcional: this.parametroAdicional,
        parametroValor: this.parametroValor
      },
      cssClass: 'modalAdaptable'
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data !== undefined) {
      this.control().setValue(data);
      this.control().markAsTouched();
    }
  }

  obtenerTextoSeleccionado(): string {
    const valor = this.control().value;

    const encontrado = this.listado().find(op =>
      this.parametroValor()
        ? op[this.parametroValor()] === valor
        : op === valor
    );
    if (!encontrado) return '';

    return `${encontrado[this.parametroNombre()]} ${this.parametroAdicional() ? encontrado[this.parametroAdicional()!] : ''}`;
  }
}
