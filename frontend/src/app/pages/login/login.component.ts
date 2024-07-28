import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // Importar Router para redirigir
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit{
  username: string = '';
  password: string = '';

  usuario: Usuario = new Usuario();

  constructor(
    private usuarioService: UsuarioService,
    private router: Router, // Inyectar Router en el constructor
  ) {}

  ngOnInit(): void {
    const user = sessionStorage.getItem('user'); // Obtener el usuario del sessionStorage

    if (user) {
      // Si el usuario no está autenticado, redirigir al inicio
      this.router.navigate(['/admin']); // Ajusta la ruta según tu configuración
    }
  }

  onSubmit() {
    this.usuario.username = this.username;
    this.usuario.password = this.password;

    this.usuarioService.postLogin(this.usuario).subscribe(
      (res) => {
        if (res.exito) { // Verificar si el inicio de sesión fue exitoso
          sessionStorage.setItem('user', JSON.stringify(res.usuario)); // Guardar usuario en sessionStorage
          this.router.navigate(['/admin']); // Redirigir a la pantalla de destino (ajusta la ruta según tu aplicación)
        } else {
          console.log('Credenciales incorrectas');
        }
      },
      (error) => {
        console.error('Error en el inicio de sesión', error);
      }
    );
  }
}