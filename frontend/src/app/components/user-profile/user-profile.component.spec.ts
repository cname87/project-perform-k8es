/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { APP_BASE_HREF, Location } from '@angular/common';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { NGXLogger } from 'ngx-logger';

import { AppModule } from '../../app.module';
import { ProfileComponent } from './user-profile.component';
import { AuthService } from '../../shared/auth.service/auth.service';
import { MockAuthService } from '../../shared/mocks/mock-auth.service';

import {
  findCssOrNot,
  ActivatedRoute,
  ActivatedRouteStub,
  click,
} from '../../shared/test-helpers';

interface ILocationSpy {
  back: jasmine.Spy;
}

describe('ProfileComponent', () => {
  /* setup function run by each sub test suite */
  async function mainSetup() {
    /* stub logger to avoid console logs */
    const loggerSpy = jasmine.createSpyObj('NGXLogger', ['trace', 'error']);

    /* stub Location service */
    const locationSpy = jasmine.createSpyObj('location', ['back']);
    /* stub ActivatedRoute with a configurable path parameter */
    const activatedRouteStub = new ActivatedRouteStub(0);

    /* note that AuthService is replaced by a mock */

    /* set up Testbed */
    await TestBed.configureTestingModule({
      imports: [AppModule, RouterTestingModule],
      declarations: [],
      providers: [
        { provide: APP_BASE_HREF, useValue: '/' }, // avoids an error message
        { provide: Location, useValue: locationSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: NGXLogger, useValue: loggerSpy },
      ],
    }).compileComponents();

    TestBed.overrideComponent(ProfileComponent, {
      set: {
        providers: [{ provide: AuthService, useClass: MockAuthService }],
      },
    });
  }

  /* get key DOM elements */
  class Page {
    get title() {
      return findCssOrNot<HTMLElement>(this.fixture, 'mat-card-title');
    }

    get name() {
      return findCssOrNot<HTMLSpanElement>(this.fixture, '#profileName');
    }

    get email() {
      return findCssOrNot<HTMLSpanElement>(this.fixture, '#profileEmail');
    }

    get goBackButton() {
      return findCssOrNot<HTMLButtonElement>(this.fixture, '#goBackBtn');
    }

    constructor(readonly fixture: ComponentFixture<ProfileComponent>) {}
  }

  function createSpies(authService: AuthService, locationSpy: ILocationSpy) {
    /* mock authService userProfile$ property */
    authService.userProfile$ = new BehaviorSubject<any>({
      email: 'testProfile.email',
      name: 'testProfile.name',
    }) as any;

    const backSpy = locationSpy.back.and.stub();
    return {
      backSpy,
    };
  }

  /* provide an object with any expected responses */
  function createExpected() {
    return {};
  }

  /* create the component, and get test variables */
  function createComponent() {
    /* create the fixture */
    const fixture = TestBed.createComponent(ProfileComponent);

    /* get the injected instances */
    // const injector = fixture.debugElement.injector;
    // const authService = injector.get<AuthService>(AuthService as any);
    const locationSpy = fixture.debugElement.injector.get<ILocationSpy>(
      Location as any,
    );
    const activatedRouteStub = fixture.debugElement.injector.get<ActivatedRouteStub>(
      ActivatedRoute as any,
    );

    const authService = fixture.debugElement.injector.get<AuthService>(
      AuthService as any,
    );
    // const testBed = getTestBed();
    // const authService = testBed.get(AuthService);

    /* get the expected values */
    const expected = createExpected();

    /* create the component instance */
    const component = fixture.componentInstance;

    /* get the spies */
    const { backSpy } = createSpies(authService, locationSpy);

    /* create a page to access the DOM elements */
    const page = new Page(fixture);

    return {
      fixture,
      component,
      page,
      backSpy,
      activatedRouteStub,
      expected,
    };
  }

  /* setup function run by each it test function that needs to test before ngOnInit is run - none in this file */
  async function preSetup() {
    await mainSetup();
    const testVars = createComponent();
    return testVars;
  }

  /* setup function run by each it test function that runs tests after the component and view are fully established */
  async function setup() {
    const testVars = await preSetup();
    /* initiate ngOnInit and view changes etc */
    testVars.fixture.detectChanges();
    await testVars.fixture.whenStable();
    testVars.fixture.detectChanges();
    await testVars.fixture.whenStable();
    /* recreate the page as it should be visible after ngOnInit */
    Object.assign(testVars, {
      page: new Page(testVars.fixture),
    });
    return testVars;
  }

  describe('before initialization', () => {
    it('should be created', async () => {
      const { component } = await preSetup();
      expect(component).toBeTruthy('component created');
    });
    it('should not display', async () => {
      const { page } = await preSetup();
      expect(page.title).toBeNull('no page displayed');
    });
  });

  describe('after ngOnInit', () => {
    it('should be created', async () => {
      const { component } = await setup();
      expect(component).toBeTruthy('component created');
    });
  });

  describe('page', () => {
    it('should have the expected profile', async () => {
      const { page } = await setup();
      expect(page.title!.innerText).toEqual('MY ACCOUNT');
      expect(page.name!.innerText).toEqual('NAME: testProfile.name');
      expect(page.email!.innerText).toEqual('EMAIL: testProfile.email');
    });
  });

  describe('user actions', () => {
    it('should call go back on clicking go back button', async () => {
      const { page, backSpy, activatedRouteStub } = await setup();
      /* set up route that the component will get */
      const routeId = 4;
      activatedRouteStub.setParameter(routeId);
      /* click the go back button */
      click(page.goBackButton!);
      expect(backSpy).toHaveBeenCalledTimes(1);
    });
  });
});
