import { Component, OnInit } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { AuthService } from '../../shared/auth.service/auth.service';
import { IsLoadingService } from '@service-work/is-loading';

import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import {
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
} from '@angular/router';
import { filter } from 'rxjs/operators';

/**
 * This application displays various views of the members of a team stored on a server.  It allows for member creation, reading, updating and deletion.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private logger: NGXLogger,
    private auth: AuthService,
    private isLoadingService: IsLoadingService,
    private router: Router,
  ) {
    this.logger.trace(`${AppComponent.name}: Starting ${AppComponent.name}`);
  }

  public isLoading$!: Observable<boolean>;
  private _isE2eTesting = false;

  get isE2eTesting() {
    return this._isE2eTesting;
  }

  ngOnInit() {
    /* check authentication state */
    this.auth.localAuthSetup();
    this._isE2eTesting = environment.e2eTesting;
    this.isLoading$ = this.isLoadingService.isLoading$();

    /* set (and clear) an isLoadingService indicator (that loads a progress bar) for routing events */
    this.router.events
      .pipe(
        filter(
          (event) =>
            event instanceof NavigationStart ||
            event instanceof NavigationEnd ||
            event instanceof NavigationCancel ||
            event instanceof NavigationError,
        ),
      )
      .subscribe((event) => {
        /* if it's the start of navigation, `add()` a loading indicator */
        if (event instanceof NavigationStart) {
          this.isLoadingService.add();
          return;
        }

        /* else navigation has ended, so `remove()` a loading indicator */
        this.isLoadingService.remove();
      });
  }
}
