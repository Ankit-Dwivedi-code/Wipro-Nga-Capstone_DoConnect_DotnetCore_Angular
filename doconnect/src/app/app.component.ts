import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { AuthService } from './core/auth.service';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu'; // NEW

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, MatToolbarModule, MatButtonModule, NgIf, MatIconModule, MatMenuModule], // +MatMenuModule
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'DoConnect';
  mobileOpen = false; // NEW

  constructor(public auth: AuthService, private router: Router) {}

  toggleMobile() { this.mobileOpen = !this.mobileOpen; } // NEW
  logout() { this.auth.logout(); this.router.navigate(['/auth/login']); }
}
