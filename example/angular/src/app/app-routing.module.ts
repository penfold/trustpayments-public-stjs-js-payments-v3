import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PaymentComponent } from './pages/payment/payment.component';
import { PaymentDetailsComponent } from './pages/payment-details/payment-details.component';
import { PersonalDataComponent } from './pages/personal-data/personal-data.component';
import { ContactDataComponent } from './pages/contact-data/contact-data.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: PaymentComponent },
  { path: 'payment-details', component: PaymentDetailsComponent },
  { path: 'personal-data', component: PersonalDataComponent },
  { path: 'contact-data', component: ContactDataComponent },
  { path: 'payment', component: PaymentComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
