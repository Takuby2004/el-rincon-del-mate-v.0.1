import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmModalComponent } from './shared/components/confirm-modal/confirm-modal.component';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, ConfirmModalComponent, ToastContainerComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'el-rincon-del-mate-frontend';
}
