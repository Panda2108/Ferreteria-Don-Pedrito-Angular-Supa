import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), // <--- Esto soluciona el error NG0908
    provideHttpClient() // <--- Para mantener viva la conexión con tu Spring Boot / MySQL
  ]
};
