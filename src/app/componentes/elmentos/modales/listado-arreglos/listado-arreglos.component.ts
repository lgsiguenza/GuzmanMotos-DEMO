import { Component, EventEmitter, inject, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { LgsInputComponent } from "../../lgs-input/lgs-input.component";
import { IonInput, IonButton, IonIcon, IonLabel, IonTextarea, IonCheckbox } from "@ionic/angular/standalone";
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
  imports: [IonTextarea, IonLabel, FormsModule, IonInput, IonButton, IonIcon, IonCheckbox],
})

export class ListadoArreglosComponent {
  
  protected tbjSvc = inject(TrabajoSb);
  protected utilSvc = inject(Utils);

  @Input() listadoArreglos:Arreglo[] = [];
  @Input() isEdicion!: boolean
  @Output() totalChange = new EventEmitter<number>();
  @Output() listaArreglos = new EventEmitter<Arreglo[]>()

  private listaArreglosLocal: Arreglo[] = [];

  constructor(){
    addIcons({add})
  }

  toggleEstado(item:any, estado:boolean){
    item.estado = estado;
    // recalcular presupuesto si fuera necesario
    this.calcularTotal();

  } 
  
   ngOnChanges(changes: SimpleChanges) {
    if (changes['listadoArreglos']) {
      if (this.listadoArreglos.length === 0) {
        this.listadoArreglos = [{
          cantidad: 0,
          nombre: '',
          problema: '',
          costo: 0
        }];
      } else {

        this.listadoArreglos = this.listadoArreglos.map(arreglo => ({
          cantidad: arreglo.cantidad,
          nombre: arreglo.nombre,
          problema: arreglo.problema,
          costo: arreglo.costo
        }));
        this.calcularTotal();
      }
    }
  }
  
  calcularTotal() {
    const total = this.listadoArreglos.reduce((acc, item) => {
      const subtotal = item.cantidad * item.costo;
      return acc + subtotal;
    }, 0);
    this.totalChange.emit(total);
  }

  agregar() {
    alert(JSON.stringify(this.listadoArreglos))
    const ultimo = this.listadoArreglos[this.listadoArreglos.length - 1];
    alert(JSON.stringify(ultimo))
    const arreglo:Arreglo ={
      cantidad: (ultimo.cantidad),
      costo: (ultimo.costo),
      nombre: ultimo.nombre,
      problema: ultimo.problema
    }
    const nuevoItem: Arreglo ={
      cantidad: parseInt(''),
      costo: parseInt(''),
      nombre: '',
      problema: ''
    } 
    if(!ultimo.cantidad || !ultimo.nombre || !ultimo.problema || !ultimo.costo){
      return;
    }

    this.listadoArreglos.push(nuevoItem)
    this.listaArreglosLocal.push(arreglo)
    this.listaArreglos.emit(this.listaArreglosLocal);

  }

}