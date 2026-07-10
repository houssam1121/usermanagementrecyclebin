import {
  Component,
  HostListener,
  signal,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideBar } from './pages/side-bar/side-bar';
import { TopBar } from './pages/top-bar/top-bar';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    SideBar,
    TopBar,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
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