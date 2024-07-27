import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  onSubmit() {
    // Lógica para manejar el inicio de sesión
    console.log('Correo:', this.email);
    console.log('Contraseña:', this.password);
  }
}
