import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'firstName-lastName-dateOfStart-FullStack-fe';
  flagDemo=false;
  changeDemo(){
    const docIcon = document.getElementById('bi-icon');
    if(this.flagDemo){     
       if(docIcon) docIcon.className="favorite-icon bi bi bi-heart";
    }
    else{    
       if(docIcon) docIcon.className="square-icon bi bi-arrow-left-square";
    }
    this.flagDemo=!this.flagDemo;
  }
}
