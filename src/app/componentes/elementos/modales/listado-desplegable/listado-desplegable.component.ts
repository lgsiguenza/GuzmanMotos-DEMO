import { Component, computed, effect, inject, input, OnInit, output, signal } from '@angular/core';
import { ModalController, IonHeader, IonToolbar, IonButtons, IonSearchbar, IonButton, IonTitle, IonContent, IonItem, IonList, IonRadioGroup, IonRadio, IonLabel, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBackCircleOutline, chevronForwardCircleOutline, closeCircleOutline, closeOutline } from 'ionicons/icons';
@Component({
  selector: 'app-listado-desplegable',
  templateUrl: './listado-desplegable.component.html',
  styleUrls: ['./listado-desplegable.component.scss'],
  imports: [IonLabel, IonRadio, IonRadioGroup, IonList, IonItem, IonTitle, IonButton, IonSearchbar, IonButtons, IonToolbar, IonHeader, IonIcon],
})
export class ListadoDesplegableComponent  implements OnInit {
  //! ===================== Servicios =====================
  private modalCtrl = inject(ModalController);
  
  
  //! ===================== Propiedades =====================
  listado = input.required<any[]>();
  parametroNombre = input.required<string>();
  parametroOpcional = input<string>();
  parametroValor = input<string | null>(null);
  
  pagina = signal(0);
  tamanio = 3;

  seleccionActual = signal<any>(null);

  seleccion = output<any>();
  
  filtro = signal('');
  
  totalPaginas = computed(() => {
    return Math.ceil(this.filtrados.length / this.tamanio);
  });
  
  get filtrados() {
    const texto = this.filtro().toLowerCase();

    return this.listado().filter(item =>
      item[this.parametroNombre()].toLowerCase().includes(texto)
    );
  }

  get paginados() {
    const inicio = this.pagina() * this.tamanio;
    return this.filtrados.slice(inicio, inicio + this.tamanio);
  }

  constructor(){
    addIcons({closeCircleOutline, chevronBackCircleOutline, chevronForwardCircleOutline})
  }
  ngOnInit() {
    effect(() => {
      const total = this.totalPaginas();
      if (this.pagina() >= total && total > 0) {
        this.pagina.set(total - 1);
      }
    });
  }

  //! ===================== Métodos =====================
  cerrar() {
    this.modalCtrl.dismiss();
  }

  seleccionar(item: any) {
    const valor = this.parametroValor()
      ? item[this.parametroValor()!]
      : item;
    this.seleccion.emit(valor);
    this.modalCtrl.dismiss(valor, 'confirm')
    this.cerrar();
  }

  seleccionarRadio(valor: any) {
    this.seleccionActual.set(valor);
  }

  siguiente() {
    if ((this.pagina() + 1) * this.tamanio < this.filtrados.length) {
      this.pagina.update(p => p + 1);
    }
  }

  anterior() {
    if (this.pagina() > 0) {
      this.pagina.update(p => p - 1);
    }
  }

  confirmar() {
    const valor = this.seleccionActual();

    if (valor !== null) {
      this.modalCtrl.dismiss(valor, 'confirm');
    }
  }

}
