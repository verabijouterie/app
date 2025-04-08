import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { ScenarioComponent } from './scenario/scenario.component';
import { TransactionComponent } from './transactions/transaction.component';
import { ScenarioListComponent } from './scenario/scenario-list.component';
import { ProductsComponent } from './products/products.component';
import { RolesComponent } from './roles/roles.component';
import { PermissionsComponent } from './permissions/permissions.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'statistics', component: StatisticsComponent },
  { path: 'scenario', component: ScenarioComponent },
  { path: 'scenario/:id', component: ScenarioComponent },
  { path: 'scenarios', component: ScenarioListComponent },
  { path: 'transaction', component: TransactionComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'roles', component: RolesComponent },
  { path: 'permissions', component: PermissionsComponent },
];
