import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonFooter, IonToolbar, IonButtons, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-modal-footer',
  templateUrl: './modal-footer.component.html',
  styleUrls: ['./modal-footer.component.scss'],
  imports: [IonFooter, IonToolbar, IonButtons, IonButton],

})
export class ModalFooterComponent{

  @Input({ required: true }) successText!: string;

  @Output() cerrar = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

}
