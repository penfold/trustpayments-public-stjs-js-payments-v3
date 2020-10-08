import { Component } from '@angular/core';

@Component({
  selector: 'app-personal-data',
  templateUrl: './personal-data.component.html',
  styleUrls: ['./personal-data.component.scss']
})
export class PersonalDataComponent {
  readonly titles = ['Mr', 'Mrs', 'Ms', 'Miss', 'Dr'];
}
