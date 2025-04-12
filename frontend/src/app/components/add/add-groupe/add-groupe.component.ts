import { Component, ElementRef, EventEmitter, HostListener, inject, Input, Output, ViewChild } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/User';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-groupe',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './add-groupe.component.html',
  styleUrl: './add-groupe.component.css'
})
export class AddGroupeComponent {
  @ViewChild('roleInput', { static: false }) roleInput!: ElementRef;
  @ViewChild('roleDropdown', { static: false }) roleDropdown!: ElementRef;
  @Output() close = new EventEmitter<void>();
  constructor(private userService:UserService) {}
  currentStep : number = 1;
  userConnected !: User;
  steps = ["Groupe", "Utilsateurs", "Menu","Permissions"];

  ngOnInit() {
    const userFromLocalStorage = localStorage.getItem('user');
    if (userFromLocalStorage) {
      this.userConnected = JSON.parse(userFromLocalStorage);
    }
    
  }
  // Navigation entre les étapes
  goToNextStep() {
    this.currentStep++;
  }
  goToPreviousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }
  // Fermer le formulaire
  closeForm() {
    this.close.emit();
  }


}
