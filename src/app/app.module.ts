import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { StorageService } from './core/services/storage.service';
import { RemoteConfigService } from './core/services/remote-config.service';

function initApp(storage: StorageService, remoteConfig: RemoteConfigService) {
  return async () => {
    // Storage must be ready before the app renders (needed for data access).
    // Race with a 5s safety timeout so a localforage hang never blocks startup.
    const storageTimeout = new Promise<void>(resolve => setTimeout(resolve, 5000));
    await Promise.race([storage.init(), storageTimeout]);

    // Remote Config is non-blocking: the signal updates whenever Firebase responds.
    // This avoids a network-dependent delay blocking the entire app startup.
    remoteConfig.init().catch(err => console.warn('[RemoteConfig] init failed', err));
  };
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot({ mode: 'ios' }),
    IonicStorageModule.forRoot(),
    AppRoutingModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: APP_INITIALIZER,
      useFactory: initApp,
      deps: [StorageService, RemoteConfigService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
