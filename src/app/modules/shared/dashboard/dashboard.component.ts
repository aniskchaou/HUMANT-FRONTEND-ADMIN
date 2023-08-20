import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

import { URLLoader } from 'src/app/main/configs/URLLoader';

import { HTTPService } from 'src/app/main/services/HTTPService';
import URLS from 'src/app/main/urls/urls';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent extends URLLoader implements OnInit {
  single: any[];
  multi: any[];

  view: any[] = [500, 450];

  // options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Departemets';
  showYAxisLabel = true;
  yAxisLabel = 'Salaries';

  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'],
  };
  patients$: any;
  doctors$: number;
  appointements$: number;
  beds$: number;

  constructor(private httpService: HTTPService) {
    super();
    //super.loadScripts();
    Object.assign(this, { single });
  }

  ngOnInit(): void {
    //super.loadScripts();
    this.httpService.getTitle().subscribe(() => {
      super.loadScripts();
    });
  }

  ngOnChanges() {
    console.log('----checked--');
    super.loadScripts();
  }

  single2: any[];
  view2: any[] = [500, 400];

  // options
  gradient2: boolean = true;
  showLegend2: boolean = true;
  showLabels2: boolean = true;
  isDoughnut2: boolean = false;
  legendPosition2: string = 'below';

  colorScheme2 = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'],
  };

  onSelect(data): void {
    console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  onActivate(data): void {
    console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data): void {
    console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }
}

export var single = [
  {
    name: 'Sales',
    value: 8940000,
  },
  {
    name: 'Production',
    value: 5000000,
  },
  {
    name: 'Management',
    value: 7200000,
  },
];
