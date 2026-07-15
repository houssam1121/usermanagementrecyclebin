import { Component, HostListener, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideBar } from './shared/side-bar/side-bar';
import { TopBar } from './shared/top-bar/top-bar';

@Component({
  selector: 'shell',
    imports: [
    RouterOutlet,
    SideBar,
    TopBar,
  ],
   styleUrl: './app.scss',
  template: `
  <div
  class="container"
  [class.sidebar-open]="sidebarOpen()"
  [class.sidebar-closed]="!sidebarOpen()"
  [class.mobile-layout]="isMobile()"
>
  <app-side-bar
    class="menu"
    [open]="sidebarOpen()"
    [mobile]="isMobile()"
    (closeSidebar)="closeSidebar()"
  ></app-side-bar>

  @if (isMobile() && sidebarOpen()) {
    <button
      type="button"
      class="sidebar-overlay"
      aria-label="Close sidebar"
      (click)="closeSidebar()"
    ></button>
  }

  <app-top-bar
    class="header"
    [sidebarOpen]="sidebarOpen()"
    (toggleSidebar)="toggleSidebar()"
  ></app-top-bar>

  <main class="content">
    <router-outlet></router-outlet>
  </main>
</div>`,
})
export class shell {
   protected readonly title = signal(
    'user-management',
  );

  protected readonly sidebarOpen =
    signal(true);

  protected readonly isMobile =
    signal(false);

  constructor() {
    this.updateScreenSize();
  }

  @HostListener('window:resize')
  protected onWindowResize(): void {
    this.updateScreenSize();
  }

  protected toggleSidebar(): void {
    this.sidebarOpen.update(
      (currentValue) => !currentValue,
    );
  }

  protected closeSidebar(): void {
    if (this.isMobile()) {
      this.sidebarOpen.set(false);
    }
  }

  private updateScreenSize(): void {
    const mobile =
      window.innerWidth <= 900;

    const wasMobile =
      this.isMobile();

    this.isMobile.set(mobile);

    if (mobile && !wasMobile) {
      this.sidebarOpen.set(false);
      return;
    }

    if (!mobile && wasMobile) {
      this.sidebarOpen.set(true);
    }
  }
}
