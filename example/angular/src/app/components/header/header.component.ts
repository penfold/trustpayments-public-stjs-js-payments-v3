import { Component } from '@angular/core';

interface LinkDefinition {
  route: string;
  title: string;
  id?: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  readonly links: LinkDefinition[] = [
    { route: 'home', title: 'Home', id: 'home' },
    { route: 'payment-details', title: 'Payment details', id: 'payment-details' },
    { route: 'personal-data', title: 'Personal data', id: 'personal-data' },
    { route: 'contact-data', title: 'Contact data', id: 'contact-data' },
    { route: 'payment', title: 'Payment', id: 'payment' }
  ];
}
