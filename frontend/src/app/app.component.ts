import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../environments/environment';

type Analysis = { summary: string; modernization: string[]; security: string[]; migration: string[]; nextSteps: string[]; caveat: string };
type Result = { project: string; mode: string; generatedAt: string; analysis: Analysis };

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: '<main class="shell"><header><div class="brand-mark">M</div><div><div class="eyebrow">ENGINEERING INTELLIGENCE</div><h1>Modernization Assistant</h1></div><span class="pill">PORTFOLIO MVP</span></header>' +
    '<section class="hero"><div><p class="eyebrow">AI-ASSISTED ENTERPRISE MODERNIZATION</p><h2>Understand what you have.<br><em>Plan what comes next.</em></h2><p class="sub">Turn a sanitized application profile into a structured engineering brief across modernization, security review and cloud migration.</p><div class="hero-tags"><span>01 / INVENTORY</span><span>02 / ASSESS</span><span>03 / ROADMAP</span></div></div><div class="hero-art"><div class="orbit o1"></div><div class="orbit o2"></div><div class="core">AI</div><span class="node n1">Codebase</span><span class="node n2">Cloud</span><span class="node n3">Security</span></div></section>' +
    '<section class="workspace"><div class="panel form-panel"><div class="panel-heading"><div><p class="eyebrow">01 / INPUT</p><h3>Application profile</h3></div><span class="step">●</span></div>' +
    '<label>Project name<input [(ngModel)]="projectName" maxlength="100"></label><label>Technology stack<input [(ngModel)]="technology" maxlength="300"></label><label>Architecture and context<textarea [(ngModel)]="description" maxlength="5000" rows="5"></textarea></label><label>Dependencies<input [(ngModel)]="dependenciesText" placeholder="Angular 15, Java 11, Redis 6"></label>' +
    '<button (click)="analyze()" [disabled]="loading || !projectName.trim() || !technology.trim() || description.trim().length < 10">{{loading ? "Building assessment…" : "Generate engineering brief"} <span>↗</span></button><button class="sample" (click)="loadSample()" [disabled]="loading">Restore sample inventory</button><p class="hint">Use synthetic or approved sanitized data only. Never submit credentials, customer information, proprietary source code or internal documents.</p><p class="error" *ngIf="error" role="alert">{{error}}</p></div>' +
    '<div class="panel results"><div class="panel-heading"><div><p class="eyebrow">02 / ENGINEERING BRIEF</p><h3>{{result ? result.project : "Your assessment"}}</h3></div><span class="mode" *ngIf="result">{{result.mode}} mode</span></div>' +
    '<div *ngIf="!result" class="empty"><div class="empty-icon">⌁</div><h3>Ready when you are</h3><p>Submit an application profile to generate a structured assessment and practical next steps.</p><div class="empty-chips"><span>Modernization</span><span>Security</span><span>Cloud migration</span></div></div>' +
    '<div *ngIf="result"><p class="summary">{{result.analysis.summary}}</p><div class="result-block"><h4>↗ Modernization opportunities</h4><ul><li *ngFor="let item of result.analysis.modernization">{{item}}</li></ul></div><div class="result-block"><h4>◇ Security review prompts</h4><ul><li *ngFor="let item of result.analysis.security">{{item}}</li></ul></div><div class="result-block"><h4>⌘ Cloud migration considerations</h4><ul><li *ngFor="let item of result.analysis.migration">{{item}}</li></ul></div><div class="result-block next"><h4>✓ Suggested next steps</h4><ul><li *ngFor="let item of result.analysis.nextSteps">{{item}}</li></ul></div><p class="caveat">{{result.analysis.caveat}}</p><p class="timestamp">Generated {{result.generatedAt | date:"medium"}}</p></div></div></section>' +
    '<footer><span>MODERNIZATION ASSISTANT · PORTFOLIO MVP</span><span>HUMAN REVIEW REQUIRED · NO AUTOMATED CODE CHANGES</span></footer></main>'
})
export class AppComponent {
  projectName = 'Claims Portal';
  technology = 'Angular 15 + Java 11 + DB2 + Redis 6 + OpenShift';
  description = 'A customer-facing claims portal with an Angular frontend calling Java REST services. DB2 stores transactional data, Redis supports caching, and containerized services run on OpenShift. Release coordination spans multiple teams.';
  dependenciesText = 'Angular 15, Java 11, Redis 6';
  loading = false;
  error = '';
  result: Result | null = null;
  constructor(private readonly http: HttpClient) {}
  loadSample(): void {
    this.projectName = 'Claims Portal';
    this.technology = 'Angular 15 + Java 11 + DB2 + Redis 6 + OpenShift';
    this.description = 'A customer-facing claims portal with an Angular frontend calling Java REST services. DB2 stores transactional data, Redis supports caching, and containerized services run on OpenShift. Release coordination spans multiple teams.';
    this.dependenciesText = 'Angular 15, Java 11, Redis 6';
    this.result = null;
    this.error = '';
  }
  analyze(): void {
    this.loading = true;
    this.error = '';
    this.result = null;
    const dependencies = this.dependenciesText.split(',').map((item) => item.trim()).filter(Boolean);
    this.http.post<Result>(environment.apiBaseUrl + '/api/analyze', {
      projectName: this.projectName.trim(), technology: this.technology.trim(),
      description: this.description.trim(), dependencies
    }).subscribe({
      next: (response) => { this.result = response; this.loading = false; },
      error: (error) => { this.error = error.error?.error ?? 'Unable to reach the API. Start the backend or check the configured API URL.'; this.loading = false; }
    });
  }
}
