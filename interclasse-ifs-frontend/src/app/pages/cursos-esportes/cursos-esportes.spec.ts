import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CursosEsportesComponent } from './cursos-esportes.component';

describe('CursosEsportes', () => {
  let component: CursosEsportesComponent;
  let fixture: ComponentFixture<CursosEsportesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CursosEsportesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CursosEsportesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
