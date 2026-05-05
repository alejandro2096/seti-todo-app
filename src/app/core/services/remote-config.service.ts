import { Injectable, signal } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  getRemoteConfig,
  fetchAndActivate,
  getValue,
  RemoteConfig,
} from 'firebase/remote-config';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RemoteConfigService {
  private remoteConfig: RemoteConfig;

  readonly statsEnabled = signal<boolean>(false);

  constructor() {
    const app = initializeApp(environment.firebase);
    this.remoteConfig = getRemoteConfig(app);

    // Default values (used when offline or before fetch)
    this.remoteConfig.defaultConfig = {
      show_statistics_panel: false,
    };

    // In dev, use short cache to see changes quickly
    this.remoteConfig.settings.minimumFetchIntervalMillis = environment.production
      ? 3600000  // 1 hour in production
      : 10000;   // 10 seconds in dev
  }

  async init(): Promise<void> {
    const timeout = new Promise<void>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 5000)
    );
    try {
      await Promise.race([fetchAndActivate(this.remoteConfig), timeout]);
      const value = getValue(this.remoteConfig, 'show_statistics_panel');
      this.statsEnabled.set(value.asBoolean());
    } catch (err) {
      console.warn('[RemoteConfig] Failed to fetch, using defaults', err);
      this.statsEnabled.set(false);
    }
  }
}
