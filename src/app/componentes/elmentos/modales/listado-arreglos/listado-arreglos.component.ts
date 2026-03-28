import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { LgsInputComponent } from "../../lgs-input/lgs-input.component";
import { IonInput, IonButton, IonIcon, IonLabel, IonTextarea } from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';
import { Arreglo } from 'src/app/models/arreglo';
import { TrabajoSb } from 'src/app/servicios/trabajo-sb';
import { Utils } from 'src/app/servicios/utils';

@Component({
  selector: 'app-listado-arreglos',
  templateUrl: './listado-arreglos.component.html',
  styleUrls: ['./listado-arreglos.component.scss'],
  imports: [IonTextarea, IonLabel, FormsModule, IonInput, IonButton, IonIcon],
})

export class ListadoArreglosComponent {
  
  protected tbjSvc = inject(TrabajoSb);
  protected utilSvc = inject(Utils);

  @Output() totalChange = new EventEmitter<number>();
  @Output() listaArreglos = new EventEmitter<Arreglo[]>()
  private listaArreglosLocal: Arreglo[] = [];

  constructor(){
    addIcons({add})
  }

  items: { unidades: number, nombre: string, detalle: string, precio: number}[] = 
  [
    {
      unidades: parseInt(''),
      nombre: '',
      detalle: '',
      precio: parseInt('')
    }
  ];

  calcularTotal() {

    const total = this.items.reduce((acc, item) => {
      const subtotal = item.unidades * item.precio;
      return acc + subtotal;
    }, 0);

    this.totalChange.emit(total);
  }

  agregar() {
    const ultimo = this.items[this.items.length - 1];

    const arreglo:Arreglo ={
      cantidad: (ultimo.unidades),
      costo: (ultimo.precio),
      nombre: ultimo.nombre,
      problema: ultimo.detalle
    } 
    if(!ultimo.unidades || !ultimo.nombre || !ultimo.detalle || !ultimo.precio){
      return;
    }

    this.items.push({
      unidades: 0,
      nombre: '',
      detalle: '',
      precio: 0
    });

    this.listaArreglosLocal.push(arreglo)
    this.listaArreglos.emit(this.listaArreglosLocal);

  }

}