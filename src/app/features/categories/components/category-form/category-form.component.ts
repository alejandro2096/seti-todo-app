import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { Category } from '../../../../core/models';
import { CATEGORY_COLORS } from '../../services/category.service';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryFormComponent implements OnInit {
  @Input() category: Category | null = null;

  form!: FormGroup;
  readonly colors = CATEGORY_COLORS;

  get isEditing(): boolean {
    return !!this.category;
  }

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.category?.name ?? '', [Validators.required, Validators.minLength(1)]],
      color: [this.category?.color ?? CATEGORY_COLORS[0], Validators.required],
    });
  }

  selectColor(color: string): void {
    this.form.get('color')?.setValue(color);
  }

  submit(): void {
    if (this.form.invalid) return;
    this.modalCtrl.dismiss(this.form.value, 'confirm');
  }

  dismiss(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
