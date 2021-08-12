import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { PaymentComponent } from './payment/payment.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { FlexModule } from '@angular/flex-layout';
import { MatSelectModule } from '@angular/material/select';
import { ComponentsModule } from '../components/components.module';
import { PaymentDetailsComponent } from './payment-details/payment-details.component';
import { RouterModule } from '@angular/router';
import { PersonalDataComponent } from './personal-data/personal-data.component';
import { ContactDataComponent } from './contact-data/contact-data.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [HomeComponent, PaymentComponent, PaymentDetailsComponent, PersonalDataComponent, ContactDataComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FlexModule,
    MatSelectModule,
    ComponentsModule,
    RouterModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ]
})
export class PagesModule {}
