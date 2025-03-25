import { Routes } from '@angular/router';
import { ChildComponent } from './components/child/child.component';
import { FormComponent } from './components/form/form.component';
import {LoginComponent} from './components/login/login.component';
import {ParticlesComponent} from './components/particles/particles.component';
import { RoleAccessGuard } from './guards/role-access.guard';
import { AccessDeniedComponent } from './components/access-denied/access-denied.component';

export const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'child', component: ChildComponent },

    {
      path: 'form',
      component: FormComponent,
      canActivate: [RoleAccessGuard]
    },
    { path: 'login' , component:LoginComponent},
    {
      path:'particles' ,
      component :ParticlesComponent,
      // canActivate: [RoleAccessGuard]
    }, {
    path: 'access-denied',
    component: AccessDeniedComponent
  },
  {
    path: '**',
    redirectTo: 'access-denied' }

];
