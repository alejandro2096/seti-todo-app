import { Component, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, AlertController, ToastController } from '@ionic/angular';
import { Task } from '../../../../core/models';
import { TaskService } from '../../services/task.service';
import { CategoryService } from '../../../categories/services/category.service';
import { TaskFormComponent } from '../../components/task-form/task-form.component';
import { TaskItemComponent } from '../../components/task-item/task-item.component';
import { RemoteConfigService } from '../../../../core/services/remote-config.service';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.page.html',
  styleUrls: ['./task-list.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, TaskItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskListPage implements OnInit {
  readonly selectedCategoryId = signal<string | null>(null);

  // Feature flag from Firebase Remote Config
  readonly showStats = this.remoteConfig.statsEnabled;

  readonly tasks = this.taskService.tasks;
  readonly categories = this.categoryService.categories;
  readonly completedCount = this.taskService.completedCount;
  readonly pendingCount = this.taskService.pendingCount;

  readonly filteredTasks = computed(() => {
    const catId = this.selectedCategoryId();
    const tasks = this.tasks();
    if (!catId) return tasks;
    return tasks.filter(t => t.categoryId === catId);
  });

  readonly completionPercentage = computed(() => {
    const total = this.tasks().length;
    if (total === 0) return 0;
    return Math.round((this.completedCount() / total) * 100);
  });

  constructor(
    private taskService: TaskService,
    private categoryService: CategoryService,
    private remoteConfig: RemoteConfigService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.taskService.load();
    await this.categoryService.load();
  }

  getCategoryForTask(task: Task) {
    return this.categoryService.getCategoryById(task.categoryId);
  }

  selectCategory(id: string | null): void {
    this.selectedCategoryId.set(
      this.selectedCategoryId() === id ? null : id
    );
  }

  async openTaskForm(task: Task | null = null): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: TaskFormComponent,
      componentProps: {
        task,
        categories: this.categories(),
      },
      breakpoints: [0, 0.75, 1],
      initialBreakpoint: 0.75,
    });
    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role !== 'confirm' || !data) return;

    if (task) {
      await this.taskService.update(task.id, data);
      await this.showToast('Tarea actualizada');
    } else {
      await this.taskService.create(data);
      await this.showToast('Tarea creada');
    }
  }

  async toggleComplete(id: string): Promise<void> {
    await this.taskService.toggleComplete(id);
  }

  async confirmDelete(id: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar tarea',
      message: '¿Estás seguro de que deseas eliminar esta tarea?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.taskService.delete(id);
            await this.showToast('Tarea eliminada');
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

  trackByTask(_: number, task: Task): string {
    return task.id;
  }
}
