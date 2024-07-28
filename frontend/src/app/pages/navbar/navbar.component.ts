import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {

  public isLoggin: boolean = false

  constructor(private router: Router) {}

  ngOnInit(): void {
    const user = sessionStorage.getItem('user'); // Obtener el usuario del sessionStorage

    if (user) {
      this.isLoggin = true;
    }
  }

  cerrarSesion() {
    // Limpiar el sessionStorage
    sessionStorage.removeItem('user'); // o la clave que estés usando para almacenar la sesión
    this.isLoggin = false;

    // Redirigir al usuario al login o página de inicio
    window.location.href = "/"
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
