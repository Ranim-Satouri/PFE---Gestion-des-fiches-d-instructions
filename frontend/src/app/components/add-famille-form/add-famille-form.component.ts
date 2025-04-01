import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-famille-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-famille-form.component.html',
  styleUrl: './add-famille-form.component.css'
})
export class AddFamilleFormComponent {
  @Output() close = new EventEmitter<void>();
  //@Output() familyAdded = new EventEmitter<{ name: string }>();

  familyForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.familyForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.familyForm.valid) {
      //this.familyAdded.emit(this.familyForm.value);
      //this.close.emit(); // auto-close after adding
    } else {
      this.familyForm.markAllAsTouched();
    }
  }

  onClose() {
    this.close.emit();
  }
}
