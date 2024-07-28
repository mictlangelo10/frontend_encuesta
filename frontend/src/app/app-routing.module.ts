import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EncuestaComponent } from './pages/encuesta/encuesta.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { AdministradorComponent } from './pages/administrador/administrador.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  //{ path: 'register', component: 'LoginComponent'},
  //{ path: 'perfil', component: 'LoginComponent'},
  { path: 'encuesta', component: EncuestaComponent },
  { path: '', component: HomeComponent },
  { path: 'admin', component: AdministradorComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

export { routes };
