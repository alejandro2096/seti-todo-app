import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { Task, Category } from '../../../../core/models';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskFormComponent implements OnInit {
  @Input() task: Task | null = null;
  @Input() categories: Category[] = [];

  form!: FormGroup;

  get isEditing(): boolean {
    return !!this.task;
  }

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      title: [this.task?.title ?? '', [Validators.required, Validators.minLength(1)]],
      description: [this.task?.description ?? ''],
      categoryId: [this.task?.categoryId ?? null],
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.modalCtrl.dismiss(this.form.value, 'confirm');
  }

  dismiss(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
