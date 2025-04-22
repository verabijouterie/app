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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog/confirmation-dialog.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

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
    DrawerComponent,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
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
    private categoriesService: CategoriesService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
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
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Kategoriyi Sil',
        message: 'Bu kategoriyi silmek istediğinizden emin misiniz?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.categories = this.categories.filter(category => category.id !== id);
        
        this.categoriesService.deleteCategory(id).subscribe({
          next: () => {
          },
          error: (error) => {
            this.loadCategories();
            this.snackBar.open('Kategori silinirken bir hata oluştu', 'Kapat', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
          }
        });
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