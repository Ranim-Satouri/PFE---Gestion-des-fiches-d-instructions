import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css'
})
export class FormComponent {
  form: FormGroup<{ [key in 'name' | 'age' | 'email' | 'password']: FormControl<string | null> }> = new FormGroup({  
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(20),
      Validators.pattern(/^[A-Za-z]+$/)
    ]),
    age: new FormControl('', [
      Validators.required,
      Validators.min(18),
      Validators.max(60)
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/) 
    ])
  });
 
  
  submitForm() {
    if (this.form.valid) {
      console.log("Formulaire soumis avec succès !", this.form.value);
    }
  }

}
