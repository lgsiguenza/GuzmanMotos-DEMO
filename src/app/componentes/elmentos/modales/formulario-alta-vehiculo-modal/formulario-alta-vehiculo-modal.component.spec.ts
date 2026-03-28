import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FormularioAltaVehiculoModalComponent } from './formulario-alta-vehiculo-modal.component';

describe('FormularioAltaVehiculoModalComponent', () => {
  let component: FormularioAltaVehiculoModalComponent;
  let fixture: ComponentFixture<FormularioAltaVehiculoModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FormularioAltaVehiculoModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FormularioAltaVehiculoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
