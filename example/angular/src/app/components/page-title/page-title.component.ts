import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-page-title',
  templateUrl: './page-title.component.html',
  styleUrls: ['./page-title.component.scss']
})
export class PageTitleComponent implements OnInit {
  private static readonly DEFAULT_TITLE = 'Angular Example';
  private static readonly DEFAULT_SUBTITLE = 'This is an Angular Example page for the TrustPayments JS library.';

  @Input() title: string;
  @Input() subtitle: string;

  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    if (!this.title) {
      this.title = PageTitleComponent.DEFAULT_TITLE;

      const pageTitleSuffix = this.activatedRoute.snapshot.data.pageTitleSuffix;

      if (pageTitleSuffix) {
        this.title = `${this.title} - ${pageTitleSuffix}`;
      }
    }

    if (!this.subtitle) {
      this.subtitle = PageTitleComponent.DEFAULT_SUBTITLE;
    }
  }
}
