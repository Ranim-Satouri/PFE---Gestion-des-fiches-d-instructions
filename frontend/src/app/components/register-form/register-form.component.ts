import {Component, EventEmitter, Input, Output} from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.css',

})
export class RegisterFormComponent {
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<any>();

  registerForm = new FormGroup({
    username: new FormControl('', Validators.required),
    matricule: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', Validators.required)
  });

  closeForm() {
    this.close.emit();
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.submit.emit(this.registerForm.value);
      this.registerForm.reset();
    }
  }
}
