import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TecnicosComponent } from './tecnicos.component';

describe('Tecnicos', () => {
  let component: TecnicosComponent;
  let fixture: ComponentFixture<TecnicosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TecnicosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TecnicosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
