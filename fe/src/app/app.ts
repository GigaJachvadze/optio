import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideBar } from './side-bar/side-bar';
import { SimulationService } from './services/simulation.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SideBar],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class App implements OnInit {
  private simulationService = inject(SimulationService);
  
  ngOnInit(): void {
    this.simulationService.connect();
  }
}