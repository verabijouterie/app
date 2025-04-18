import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CategoryListComponent } from './category-list.component';
import { DrawerComponent } from '../shared/drawer/drawer.component';
import { CategoriesService } from '../services/categories.service';
import { Category } from '../interfaces/category.interface';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    CategoryListComponent,
    DrawerComponent
  ],
  templateUrl: './categories.component.html'
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  categoryForm: FormGroup;
  editMode = false;
  selectedCategoryId: number | null = null;
  isDrawerOpen = false;
  skipDrawerAnimation = true;

  constructor(
    private fb: FormBuilder,
    private categoriesService: CategoriesService
  ) {
    this.categoryForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      category_id: [null]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    setTimeout(() => {
      this.skipDrawerAnimation = false;
    }, 100);
  }

  loadCategories(): void {
    this.categoriesService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  openCategoryDrawer(): void {
    if (!this.editMode) {
      this.categoryForm.reset({
        name: ''
      });
    }
    this.isDrawerOpen = true;
  }

  onDrawerClose(): void {
    this.isDrawerOpen = false;
    this.resetForm();
  }

  onSubmit(): void {
    if (this.categoryForm.valid) {
      const formValue = this.categoryForm.value;
      const category: Category = {
        ...formValue,
        id: this.editMode ? this.selectedCategoryId! : null,
      };

      if (this.editMode && category.id) {
        this.categoriesService.updateCategory(category.id, category).subscribe({
          next: (updatedCategory) => {
            this.loadCategories();
            this.onDrawerClose();
          },
          error: (error) => {
            console.error('Error updating category:', error);
          }
        });
      } else {
        this.categoriesService.createCategory(category).subscribe({
          next: (newCategory) => {
            this.loadCategories();
            this.onDrawerClose();
          },
          error: (error) => {
            console.error('Error creating category:', error);
          }
        });
      }
    }
  }

  editCategory(category: Category): void {
    this.editMode = true;
    this.selectedCategoryId = category.id || null;
    this.categoryForm.patchValue({
      id: category.id,
      name: category.name,
    });
    this.openCategoryDrawer();
  }

  deleteCategory(id: number): void {
    this.categoriesService.deleteCategory(id).subscribe({
      next: () => {
        this.loadCategories();
      },
      error: (error) => {
        console.error('Error deleting category:', error);
      }
    });
  }

  resetForm(): void {
    this.categoryForm.reset({
      name: ''
    });
    this.editMode = false;
    this.selectedCategoryId = null;
  }

} 