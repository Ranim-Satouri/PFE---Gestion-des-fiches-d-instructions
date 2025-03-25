import { Routes } from '@angular/router';
import { ChildComponent } from './components/child/child.component';
import { ParentComponent } from './pages/parent/parent.component';
import { FormComponent } from './components/form/form.component';
import { FicheListComponent } from './components/fiche-list/fiche-list.component';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
    { path: '', component: ParentComponent },
    { path: 'child', component: ChildComponent },
    { path: 'form', component: FormComponent},
    {
        path: '',
        component: LayoutComponent,  // Toutes ces routes sont sous le Layout (avec navbar et sidebar)
        children: [
            { path: 'fichelist', component: FicheListComponent },
        ]
    }
];
