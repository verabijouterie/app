import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { ScenarioComponent } from './scenarios/scenario.component';
import { ScenarioListComponent } from './scenarios/scenario-list.component';
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
import { OrderListComponent } from './orders/order-list.component';
import { OrderComponent } from './orders/order.component';
import { WholesalersComponent } from './wholesalers/wholesaler.component';
import { SupplyListComponent } from './supplies/supply-list.component';
import { SupplyComponent } from './supplies/supply.component';
export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'statistics', component: StatisticsComponent },
      { path: 'scenarios', component: ScenarioListComponent },
      { path: 'scenarios/new', component: ScenarioComponent },
      { path: 'scenarios/:id', component: ScenarioComponent },
      { path: 'orders', component: OrderListComponent },
      { path: 'orders/new', component: OrderComponent },
      { path: 'orders/:id', component: OrderComponent },
      { path: 'supplies', component: SupplyListComponent },
      { path: 'supplies/new', component: SupplyComponent },
      { path: 'supplies/:id', component: SupplyComponent },
      { path: 'transaction', component: TransactionComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'roles', component: RolesComponent },
      { path: 'permissions', component: PermissionsComponent },
      { path: 'users', component: UsersComponent },
      { path: 'categories', component: CategoriesComponent },
      { path: 'wholesalers', component: WholesalersComponent },
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
