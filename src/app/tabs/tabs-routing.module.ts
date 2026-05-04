import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'tasks',
        loadComponent: () =>
          import('../features/tasks/pages/task-list/task-list.page').then(
            m => m.TaskListPage
          ),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('../features/categories/pages/category-list/category-list.page').then(
            m => m.CategoryListPage
          ),
      },
      { path: '', redirectTo: 'tasks', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsRoutingModule {}
