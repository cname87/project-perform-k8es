import { Component } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

import { routes } from '../../config';

interface ILink {
  path: string;
  display: string;
  disabled?: boolean;
}

/**
 * This module displays various views of the members of a team stored on a server.  It allows for member creation, reading, updating and deletion.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  /* main header */
  public header = 'Team Members';

  /* routerLink links */
  private dashboard = routes.dashboard;
  private membersList = routes.membersList;
  private detail = routes.detail;
  links: ILink[] = [
    {
      path: '/' + this.dashboard.path,
      display: this.dashboard.displayName,
    },
    {
      path: '/' + this.membersList.path,
      display: this.membersList.displayName,
    },
    {
      path: '/' + this.detail.path,
      display: this.detail.displayName,
      disabled: true,
    },
  ];
  constructor(private logger: NGXLogger) {
    this.logger.trace(AppComponent.name + ': Starting AppComponent');
  }

  trackByFn(_index: number, link: ILink): string | null {
    return link ? link.path : null;
  }
}