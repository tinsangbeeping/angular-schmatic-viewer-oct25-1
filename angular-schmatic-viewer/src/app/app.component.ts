import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { SchematicCanvasComponent } from './canvas/schematic-canvas.component';
import { ProjectModel } from './core/models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SchematicCanvasComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private http = inject(HttpClient);
  project?: ProjectModel;
  loading = true;
  error?: string;

  ngOnInit() {
    this.http.get<ProjectModel>('assets/4_P4_project.json').subscribe({
      next: (proj) => { this.project = proj; this.loading = false; },
      error: (e) => { this.error = String(e); this.loading = false; }
    });
  }
}
