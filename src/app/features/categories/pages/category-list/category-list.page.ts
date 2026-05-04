import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, AlertController, ToastController } from '@ionic/angular';
import { Category } from '../../../../core/models';
import { CategoryService } from '../../services/category.service';
import { CategoryFormComponent } from '../../components/category-form/category-form.component';
import { TaskService } from '../../../tasks/services/task.service';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.page.html',
  styleUrls: ['./category-list.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryListPage implements OnInit {
  readonly categories = this.categoryService.categories;
  readonly tasks = this.taskService.tasks;

  constructor(
    private categoryService: CategoryService,
    private taskService: TaskService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.categoryService.load();
    await this.taskService.load();
  }

  getTaskCount(categoryId: string): number {
    return this.tasks().filter(t => t.categoryId === categoryId).length;
  }

  async openCategoryForm(category: Category | null = null): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: CategoryFormComponent,
      componentProps: { category },
      breakpoints: [0, 0.6],
      initialBreakpoint: 0.6,
    });
    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role !== 'confirm' || !data) return;

    if (category) {
      await this.categoryService.update(category.id, data);
      await this.showToast('Categoría actualizada');
    } else {
      await this.categoryService.create(data);
      await this.showToast('Categoría creada');
    }
  }

  async confirmDelete(category: Category): Promise<void> {
    const taskCount = this.getTaskCount(category.id);
    const message = taskCount > 0
      ? `Esta categoría tiene ${taskCount} tarea(s). Las tareas no serán eliminadas, solo perderán la categoría.`
      : '¿Estás seguro de que deseas eliminar esta categoría?';

    const alert = await this.alertCtrl.create({
      header: 'Eliminar categoría',
      message,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            const affected = this.tasks().filter(t => t.categoryId === category.id);
            for (const task of affected) {
              await this.taskService.update(task.id, { categoryId: null });
            }
            await this.categoryService.delete(category.id);
            await this.showToast('Categoría eliminada');
          },
        },
      ],
    });
    await alert.present();
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 1500,
      position: 'bottom',
      color: 'dark',
    });
    await toast.present();
  }

  trackByCategory(_: number, category: Category): string {
    return category.id;
  }
}
