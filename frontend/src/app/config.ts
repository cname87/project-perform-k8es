import { HttpErrorResponse } from '@angular/common/http';
import { InjectionToken } from '@angular/core';

/* app component routing elements */
const dashboard = {
  path: 'dashboard',
  displayName: 'MEMBERS DASHBOARD',
};
const membersList = {
  path: 'memberslist',
  displayName: 'MEMBERS LIST',
};
const detail = {
  path: 'detail',
  displayName: 'MEMBER DETAIL',
};
export const routes = {
  dashboard,
  membersList,
  detail,
};

/* import to access variable that informs if E2e build in use */
export const E2E_TESTING = new InjectionToken<boolean>('e2e_testing');

/* interface for bug report thrown from members.service */
export interface IErrReport {
  /* the handled error is always stored here */
  error: HttpErrorResponse;
  /* every handled error will have allocatedType set */
  allocatedType: 'Http client-side' | 'Http server-side' | 'TBC';
  /*  set true if user is informed etc => errorHandlerService will not send error message etc */
  isHandled?: boolean;
}

/* handled error types */
export const errorTypes = {
  httpClientSide: 'Http client-side',
  httpServerSide: 'Http server-side',
};

/* test urls for E2eTestInterceptor */
export const errorTestUrls = {
  /* first test get members that match a term on the dashboard page */
  getAll: 'GET:api-v1/members?name=error',
  /* then go to members list page */
  /* try delete member 10 */
  delete: 'DELETE:api-v1/members/10',
  /* then try add a member */
  post: 'POST:api-v1/members',
  /* then try get the member detail page for member 10 */
  getOne: 'GET:api-v1/members/10',
  /* then go to membersList page and go to member 9 without error and try update member 9 */
  put: 'PUT:api-v1/members',
};

/* dummy member for e2e error testing */
export const errorMember = {
  id: 10,
  name: 'errorName',
};

/* dummy get members search term for e2e error testing */
export const errorSearchTerm = 'errorSearchTerm';

/* cache timeout in ms */
export const maxAge = 300000;