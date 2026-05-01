import { TitleCasePipe } from '@angular/common';
import { Component, computed, Input, input, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonSelect, IonSelectOption } from "@ionic/angular/standalone";

@Component({
  selector: 'app-lgs-desplegable',
  templateUrl: './lgs-desplegable.component.html',
  styleUrls: ['./lgs-desplegable.component.scss'],
  imports: [ReactiveFormsModule, FormsModule, IonSelect, IonSelectOption, TitleCasePipe],
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
  protected listado = computed(()=>{
    return this.opciones();
  })
  
  constructor() { }

  ngOnInit() {}

}
