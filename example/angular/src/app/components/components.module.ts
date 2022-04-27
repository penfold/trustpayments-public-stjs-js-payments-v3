import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { TokenizedCardPaymentFormComponent } from './tokenized-card-payment-form/tokenized-card-payment-form.component';
import { PaymentFormComponent } from './payment-form/payment-form.component';
import { PageTitleComponent } from './page-title/page-title.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';

@NgModule({
  declarations: [HeaderComponent, FooterComponent, PageTitleComponent, PaymentFormComponent, TokenizedCardPaymentFormComponent],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatTabsModule,
    FlexLayoutModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,

  ],
  exports: [HeaderComponent, FooterComponent, PageTitleComponent, PaymentFormComponent, TokenizedCardPaymentFormComponent],
})
export class ComponentsModule {}
