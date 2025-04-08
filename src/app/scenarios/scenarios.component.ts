import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Scenario } from '../interfaces/scenario.interface';
import { ScenarioService } from '../services/scenario.service';
import { DrawerComponent } from '../shared/drawer/drawer.component';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-scenarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    DrawerComponent,
    DragDropModule
  ],
  templateUrl: './scenarios.component.html'
})
export class ScenariosComponent implements OnInit {
  scenarios: Scenario[] = [];
  scenarioForm: FormGroup;
  editMode = false;
  selectedScenarioId: number | null = null;
  isDrawerOpen = false;
  skipDrawerAnimation = true;

  constructor(
    private fb: FormBuilder,
    private scenarioService: ScenarioService
  ) {
    this.scenarioForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadScenarios();
    setTimeout(() => {
      this.skipDrawerAnimation = false;
    }, 100);
  }

  loadScenarios(): void {
    this.scenarioService.getScenarios().subscribe({
      next: (scenarios) => this.scenarios = scenarios,
      error: (error) => console.error('Error loading scenarios:', error)
    });
  }

  openScenarioDrawer(): void {
    this.isDrawerOpen = true;
  }

  onDrawerClose(): void {
    this.isDrawerOpen = false;
    this.resetForm();
  }

  editScenario(scenario: Scenario): void {
    this.editMode = true;
    this.selectedScenarioId = scenario.id;
    this.scenarioForm.patchValue({
      name: scenario.name,
      description: scenario.description
    });
    this.openScenarioDrawer();
  }

  deleteScenario(id: number): void {
    this.scenarioService.deleteScenario(id).subscribe({
      next: () => this.loadScenarios(),
      error: (error) => console.error('Error deleting scenario:', error)
    });
  }

  onSubmit(): void {
    if (this.scenarioForm.valid) {
      const scenario: Scenario = this.scenarioForm.value;
      
      if (this.editMode && this.selectedScenarioId) {
        this.scenarioService.updateScenario(this.selectedScenarioId, scenario).subscribe({
          next: () => {
            this.loadScenarios();
            this.onDrawerClose();
          },
          error: (error) => console.error('Error updating scenario:', error)
        });
      } else {
        this.scenarioService.createScenario(scenario).subscribe({
          next: () => {
            this.loadScenarios();
            this.onDrawerClose();
          },
          error: (error) => console.error('Error creating scenario:', error)
        });
      }
    }
  }

  resetForm(): void {
    this.scenarioForm.reset();
    this.editMode = false;
    this.selectedScenarioId = null;
  }

  drop(event: CdkDragDrop<Scenario[]>) {
    const scenarios = [...this.scenarios];
    const movedItem = scenarios[event.previousIndex];
    scenarios.splice(event.previousIndex, 1);
    scenarios.splice(event.currentIndex, 0, movedItem);
    
    // Update row_index for all scenarios
    scenarios.forEach((scenario, index) => {
      scenario.row_index = index;
      this.scenarioService.updateScenario(scenario.id!, scenario).subscribe({
        error: (error) => console.error('Error updating scenario order:', error)
      });
    });
    
    this.scenarios = scenarios;
  }
} 