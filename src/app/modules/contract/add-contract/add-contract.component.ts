import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';
import ComplainValidation from 'src/app/main/validations/ComplainValidation';
import ContractValidation from 'src/app/main/validations/ContractValidation';

@Component({
  selector: 'app-add-contract',
  templateUrl: './add-contract.component.html',
  styleUrls: ['./add-contract.component.css'],
})
export class AddContractComponent extends URLLoader implements OnInit {
  employees$: any[];
  contractForm: FormGroup;
  contractTypes$: any[];
  salaryTypes$: any[];
  departements$: any[];
  jobs$: any[];
  @Output() closeModalEvent = new EventEmitter<string>();

  constructor(
    private validation: ContractValidation,
    // private message: ComplainMessage,
    private httpService: HTTPService,
    private router: Router
  ) {
    super();
    this.contractForm = this.validation.formGroupInstance;
  }

  ngOnInit(): void {
    this.getEmployees();
    this.getJobs();
    this.getDepartements();
    this.getSalararyTypes();
    this.getContractTypes();
  }

  goBack() {
    this.router
      .navigateByUrl('/dashboard', { skipLocationChange: true })
      .then(() => {
        this.router.navigate(['/contract']);
      });
  }

  add() {
    this.contractForm.value.employee = this.employees$.filter(
      (x) => x.id == parseInt(this.contractForm.value.employee)
    )[0];

    this.contractForm.value.contractType = this.departements$.filter(
      (x) => x.id == parseInt(this.contractForm.value.contractType)
    )[0];
    // this.submitted = true;
    // if (this.validation.checkValidation()) {
    this.httpService
      .create(CONFIG.URL_BASE + '/contract/create', this.contractForm.value)
      .catch((e) => {
        console.log(e);
      })
      .then(() => {
        console.log(this.contractForm.value);
        // this.contractTypeForm.reset();
        //this.closeModal();
      })
      .finally(() => {
        this.contractForm.reset();
        this.closeModalEvent.emit();
        this.goBack();
      });

    //this.goBack();
    /*super.show(
        'Confirmation',
        '',
        //this.msg.addConfirmation[CONFIG.getInstance().getLang()],
        'success'
      );*/
    //}
  }

  getEmployees() {
    // this.loading = true;
    this.httpService
      .getAll(CONFIG.URL_BASE + '/employee/all')
      //.pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (data: any[]) => {
          this.employees$ = data;
          console.log(data);
          //this.loading = false;
        },
        (err: HttpErrorResponse) => {
          super.show('Error', err.message, 'warning');
        }
      );
  }

  getJobs() {
    // this.loading = true;
    this.httpService
      .getAll(CONFIG.URL_BASE + '/job/all')
      //.pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (data: any[]) => {
          this.jobs$ = data;
          console.log(data);
          //this.loading = false;
        },
        (err: HttpErrorResponse) => {
          super.show('Error', err.message, 'warning');
        }
      );
  }

  getDepartements() {
    // this.loading = true;
    this.httpService
      .getAll(CONFIG.URL_BASE + '/departement/all')
      //.pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (data: any[]) => {
          this.departements$ = data;
          console.log(data);
          //this.loading = false;
        },
        (err: HttpErrorResponse) => {
          super.show('Error', err.message, 'warning');
        }
      );
  }

  getSalararyTypes() {
    // this.loading = true;
    this.httpService
      .getAll(CONFIG.URL_BASE + '/salary/all')
      //.pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (data: any[]) => {
          this.salaryTypes$ = data;
          console.log(data);
          //this.loading = false;
        },
        (err: HttpErrorResponse) => {
          super.show('Error', err.message, 'warning');
        }
      );
  }
  getContractTypes() {
    // this.loading = true;
    this.httpService
      .getAll(CONFIG.URL_BASE + '/contracttype/all')
      //.pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (data: any[]) => {
          this.contractTypes$ = data;
          console.log(data);
          //this.loading = false;
        },
        (err: HttpErrorResponse) => {
          super.show('Error', err.message, 'warning');
        }
      );
  }
}
