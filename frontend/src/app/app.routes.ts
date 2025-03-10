import { Routes } from '@angular/router';
import { ChildComponent } from './components/child/child.component';
import { ParentComponent } from './pages/parent/parent.component';
import { FormComponent } from './components/form/form.component';

export const routes: Routes = [
    { path: '', component: ParentComponent },
    { path: 'child', component: ChildComponent },
    { path: 'form', component: FormComponent},
];
