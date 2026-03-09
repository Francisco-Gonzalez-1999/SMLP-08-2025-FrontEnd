import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'SMLP-08-2025-FrontEnd';

  constructor(private msalService: MsalService) {}

  async ngOnInit() {
    try {
      await this.msalService.initialize();
      // console.log('MSAL initialized successfully');
    } catch (error) {
      // console.error('MSAL initialization failed', error);
    } finally {
      // this.isInitializing = false;
    }
  }

}
