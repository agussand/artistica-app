import { TestBed } from '@angular/core/testing';

import { PresupuestoCalculatorService } from './presupuesto-calculator.service';

describe('PresupuestoCalculatorService', () => {
  let service: PresupuestoCalculatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PresupuestoCalculatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
