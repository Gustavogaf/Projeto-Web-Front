import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtletasEquipesComponent } from './atletas-equipes.component';

describe('AtletasEquipes', () => {
  let component: AtletasEquipesComponent;
  let fixture: ComponentFixture<AtletasEquipesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AtletasEquipesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AtletasEquipesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
