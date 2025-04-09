import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { NavItemComponent } from '../../nav-item/nav-item.component';
import { NavItem } from '../../interfaces/nav-item.interface';
import { navItems } from '../../config/navigation';
import { filter, Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [CommonModule, RouterModule, NavItemComponent],
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  isSidebarOpen = false;
  currentActiveItem: NavItem | null = null;
  navItems = navItems.map(item => ({ ...item, isActive: false }));

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: any) => {
      this.updateActiveNavItem(event.url);
    });

    // Set initial active state
    this.updateActiveNavItem(this.router.url);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }

  selectNavItem(item: NavItem) {
    // Update all items to inactive
    this.navItems.forEach(navItem => {
      navItem.isActive = false;
    });
    
    // Set the selected item as active
    item.isActive = true;
    this.currentActiveItem = item;

    // Navigate to the selected route
    this.router.navigate([item.link]);
  }

  private updateActiveNavItem(url: string) {
    this.navItems.forEach(item => {
      item.isActive = url.startsWith(item.link);
    });
    this.currentActiveItem = this.navItems.find(item => item.isActive) || null;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/signup']);
  }
} 