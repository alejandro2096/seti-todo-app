import { NgModule } from '@angular/core';
import { TabsRoutingModule } from './tabs-routing.module';
import { TabsPage } from './tabs.page';

@NgModule({
  imports: [TabsPage, TabsRoutingModule],
})
export class TabsModule {}
