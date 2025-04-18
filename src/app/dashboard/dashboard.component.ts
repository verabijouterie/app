import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-dashboard',
    imports: [CommonModule],
    template: `
    <div class="bg-white shadow rounded-lg p-6">
      <h1 class="text-2xl font-semibold text-gray-900">Gösterge Paneli</h1>
      <p class="mt-4 text-gray-600">Gösterge paneline hoşgeldiniz. Burada verilerinize genel bir bakış elde edebilirsiniz.</p>
    </div>
  `
})
export class DashboardComponent {} 