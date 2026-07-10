import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import {
  RouterLink,
  RouterLinkActive,
} from '@angular/router';

interface NavigationItem {
  label: string;
  icon: string;
  route: string;
  exact?: boolean;
}

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.scss',
})
export class SideBar {
  @Input() open = true;
  @Input() mobile = false;

  @Output() closeSidebar =
    new EventEmitter<void>();

  protected readonly navigationItems:
    NavigationItem[] = [
      {
        label: 'Dashboard',
        icon: 'dashboard',
        route: '/dashboard',
      },
      {
        label: 'Users',
        icon: 'group',
        route: '/users',
      },
      {
        label: 'Roles',
        icon: 'admin_panel_settings',
        route: '/roles',
      },
      {
        label: 'Permissions',
        icon: 'verified_user',
        route: '/permissions',
      },
      {
        label: 'Activity Logs',
        icon: 'history',
        route: '/activity-logs',
      },
      {
        label: 'Settings',
        icon: 'settings',
        route: '/settings',
      },
    ];

  protected onNavigationClick(): void {
    if (this.mobile) {
      this.closeSidebar.emit();
    }
  }

  protected requestClose(): void {
    this.closeSidebar.emit();
  }
}