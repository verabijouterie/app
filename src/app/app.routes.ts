import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { ScenarioComponent } from './scenario/scenario.component';
import { TransactionComponent } from './transactions/transaction.component';
import { ProductsComponent } from './products/products.component';
import { RolesComponent } from './roles/roles.component';
import { PermissionsComponent } from './permissions/permissions.component';
import { UsersComponent } from './users/users.component';
import { SignupComponent } from './signup/signup.component';
import { LayoutComponent } from './layouts/main/layout.component';
import { SignupLayoutComponent } from './layouts/signup/signup-layout.component';
import { AuthGuard } from './guards/auth.guard';
import { NoAuthGuard } from './guards/no-auth.guard';
import { CategoriesComponent } from './categories/categories.component';

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
      { path: 'transaction', component: TransactionComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'roles', component: RolesComponent },
      { path: 'permissions', component: PermissionsComponent },
      { path: 'users', component: UsersComponent },
      { path: 'categories', component: CategoriesComponent },
    ]
  },
  {
    path: 'signup',
    component: SignupLayoutComponent,
    canActivate: [NoAuthGuard],
    children: [
      { path: '', component: SignupComponent }
    ]
  }
];
