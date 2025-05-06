import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode(); // ✅ this disables Angular's dev/debug APIs
}
if (environment.production) {
  Object.defineProperty(window, 'ng', {
    value: undefined,
    writable: false
  });
}

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
