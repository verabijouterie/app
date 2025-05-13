import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Product } from '../interfaces/product.interface';
import { Category } from '../interfaces/category.interface';
import { CARAT_OPTIONS, CARAT_PURITY_MAP_GOLD } from '../config/constants';

@Component({
    selector: 'app-product',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatAutocompleteModule,
        MatCheckboxModule
    ],
    templateUrl: './product.component.html'
})
export class ProductComponent implements OnInit, OnChanges {
    @Output() productSubmit = new EventEmitter<Product>();
    @Output() cancel = new EventEmitter<void>();
    @Input() product: Product | null = null;
    @Input() categories: Category[] = [];

    is_editing = false;
    caratOptions = CARAT_OPTIONS.map(carat => Number(carat));
    caratPurityMapGold = CARAT_PURITY_MAP_GOLD;

    formData: Product = {
        id: null,
        weight24k: null,
        name: '',
        is_gold: false,
        contains_gold: false,
        carat: null,
        weight_brut: null,
        category_id: null
    };



    ngOnInit(): void {

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['product']) {
            if (!this.product) {
                this.is_editing = false;
                this.formData = {
                    id: null,
                    weight24k: null,
                    name: '',
                    is_gold: false,
                    contains_gold: false,
                    carat: null,
                    weight_brut: null,
                    category_id: null
                }
            }
            else {
                this.is_editing = true;
                this.formData = {
                    ...this.product,
                    is_gold: Boolean(this.product.is_gold),
                    contains_gold: Boolean(this.product.contains_gold),
                    carat: this.product.carat ? Number(this.product.carat) : null
                };
            }
        }
    }


    onIsGoldChange(): void {
        if (this.formData.is_gold) {
            this.formData.contains_gold = false;
        } else if (!this.formData.contains_gold) {
            this.formData.carat = null;
            this.formData.weight_brut = null;
        }
    }

    onContainsGoldChange(): void {
        if (this.formData.contains_gold) {
            this.formData.is_gold = false;
        } else if (!this.formData.is_gold) {
            this.formData.carat = null;
            this.formData.weight_brut = null;
        }
    }

    onCaratChange(): void {
        if (!this.formData.carat) {
            this.formData.weight_brut = null;
        }
    }

    isFormValid(): boolean {
        return Boolean(this.formData.name) && this.formData.category_id !== null;
    }

    onSubmit(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        const product: Product = {
            name: this.formData.name,
            is_gold: Boolean(this.formData.is_gold),
            contains_gold: Boolean(this.formData.contains_gold),
            id: this.is_editing ? (this.product?.id ?? null) : null,
            carat: (this.formData.is_gold || this.formData.contains_gold) ?
                (this.formData.carat as typeof CARAT_OPTIONS[number]) : null,
            weight_brut: (this.formData.is_gold || this.formData.contains_gold) && this.formData.weight_brut ?
                Number(this.formData.weight_brut) : null,
            weight24k: this.formData.weight_brut && this.formData.carat ?
                this.calculateTotal24k(this.formData.weight_brut, this.formData.carat) : null,
            category_id: this.formData.category_id
        };

        this.productSubmit.emit(product);;

    }



    onCancel(): void {
        this.cancel.emit();

    }

    calculateTotal24k(weight_brut: number | null, carat: typeof CARAT_OPTIONS[number] | null): number | null {
        if (!weight_brut || !carat) return null;
        const purity = this.caratPurityMapGold[carat];
        if (!purity) return null;
        const weight24K = weight_brut * purity;
        return parseFloat(weight24K.toFixed(4));
    }
} 