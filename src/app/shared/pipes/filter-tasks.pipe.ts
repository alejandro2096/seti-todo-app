import { Pipe, PipeTransform } from '@angular/core';
import { Task } from '../../core/models';

@Pipe({ name: 'filterTasks', standalone: true })
export class FilterTasksPipe implements PipeTransform {
  transform(tasks: Task[], categoryId: string | null): Task[] {
    if (!categoryId) return tasks;
    return tasks.filter(t => t.categoryId === categoryId);
  }
}
