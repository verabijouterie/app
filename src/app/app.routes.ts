import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { ScenarioComponent } from './scenario/scenario.component';
import { TransactionComponent } from './transactions/transaction.component';
import { ScenarioListComponent } from './scenario/scenario-list.component';
import { ProductsComponent } from './products/products.component';
import { RolesComponent } from './roles/roles.component';
import { PermissionsComponent } from './permissions/permissions.component';
import { UsersComponent } from './users/users.component';
import { SignupComponent } from './signup/signup.component';
import { LayoutComponent } from './layouts/main/layout.component';
import { SignupLayoutComponent } from './layouts/signup/signup-layout.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
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
      { path: 'users', component: UsersComponent },
    ]
  },
  {
    path: 'signup',
    component: SignupLayoutComponent,
    children: [
      { path: '', component: SignupComponent }
    ]
  }
];
