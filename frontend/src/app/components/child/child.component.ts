import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, output } from '@angular/core';
import { User } from '../../models/user';

//ng g c components/child
@Component({
  selector: 'app-child',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './child.component.html',
  styleUrl: './child.component.css'
})
export class ChildComponent {
  num : number = 0; 
  @Input() usersChild !: User[] ; // jeya men parent component

  @Output() eventEmit = new EventEmitter<number>(); // bech nabaath bih num lel parent component
  incrementer() { 
    this.num++;
    this.eventEmit.emit(this.num); // nabaath num lel parent component
  }

}
