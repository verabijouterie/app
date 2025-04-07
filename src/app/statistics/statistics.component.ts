import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-statistics',
    imports: [CommonModule],
    template: `
    <div class="bg-white shadow rounded-lg p-6">
      <h1 class="text-2xl font-semibold text-gray-900">Statistics</h1>
      <p class="mt-4 text-gray-600">Welcome to your statistics. Here you can see an overview of your data.</p>
    </div>
  `
})
export class StatisticsComponent {} 