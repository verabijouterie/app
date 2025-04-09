import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    MatCardModule,
    CommonModule
  ],
  templateUrl: './signup-layout.component.html'
})
export class SignupLayoutComponent {
}
