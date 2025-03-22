import { Component } from '@angular/core';
import { ChildComponent } from "../../components/child/child.component";
import { Genre, Role, User, UserStatus } from '../../models/User';
import {FicheService} from '../../services/fiche.service';
import { Fiche, FicheAction, FicheStatus } from '../../models/Fiche';
import { Console } from 'console';
import { Famille } from '../../models/Famille';
import { Produit } from '../../models/Produit';
//ng g c pages/parent

@Component({
  selector: 'app-parent',
  standalone: true,
  imports: [ChildComponent],
  templateUrl: './parent.component.html',
  styleUrl: './parent.component.css'
})
export class ParentComponent {

  constructor(private FicheService: FicheService) {} 

  // ----------------------- Input  -----------------------------//
  usersParent : any[] = [{name: 'Ali', age: 20,id: 0},{name: 'Mohamed', age: 25,id: 0},];  // usersParent bech nabaathou lel child component
  
  // ----------------------- Output  -----------------------------//
  numParent !: number ; // numParent bech nrecupereha mel child component
  TakeEvent(event: number) { // Focntion bech nrecuperi beha el num mel child component
    this.numParent = event;
  }

  // awwel ma trefreshi el page
  ngOnInit() { 
    this.getUsers();
  }

  // ----------------------- Service  -----------------------------//
  getUsers() { // Function bech nrecuperi el users mel service
    this.FicheService.getFicheHistory(14).subscribe({
      next : (response :Fiche[]) => {  
        console.log('fetching users success:', response);
      },
      error : (error : any) => {  
        console.error('fetching users error:', error);
      }
    });
  }

}
