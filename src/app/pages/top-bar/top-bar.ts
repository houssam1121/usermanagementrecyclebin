import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.scss',
})
export class TopBar {
  @Input() sidebarOpen = true;

  @Output() toggleSidebar =
    new EventEmitter<void>();

  protected onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }
}