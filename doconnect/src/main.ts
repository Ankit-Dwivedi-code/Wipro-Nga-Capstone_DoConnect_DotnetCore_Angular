// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { JwtInterceptor } from './app/core/jwt.interceptor';
import { ErrorInterceptor } from './app/core/error.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }, // Register the JWT interceptor
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }, // Register the error interceptor

    provideRouter(routes), // Provide the routes
    importProvidersFrom(HttpClientModule), // Import HttpClientModule
    provideAnimations(),   // Angular Material animations
  ],
}).catch(err => console.error(err));
