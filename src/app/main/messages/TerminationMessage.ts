import { Injectable } from '@angular/core';
import CONFIG from '../urls/urls';

@Injectable({
  providedIn: 'root',
})
export default class BookMessage {
  addConfirmation = {
    FR: "L'élément a été ajouté",
    EN: 'Item has been added',
    AR: 'تمت إضافة العنصر',
  };

  editConfirmation = {
    FR: "L'élément a été modifié",
    EN: 'Item has been modified',
    AR: 'تم تعديل العنصر',
  };

  deleteConfirmation = {
    FR: "L'élément a été supprimé",
    EN: 'Item has been removed',
    AR: 'تم حذف العنصر',
  };

  titleConfirmation = {
    FR: 'Confirmation',
    EN: 'Message',
    AR: 'تأكيد',
  };

  confirmationMessages = {
    title: this.titleConfirmation[CONFIG.getInstance().getLang()],
    add: this.addConfirmation[CONFIG.getInstance().getLang()],
    edit: this.editConfirmation[CONFIG.getInstance().getLang()],
    delete: this.deleteConfirmation[CONFIG.getInstance().getLang()],
  };

  validationMessage = {
    typeTermination: "'new FormControl('')'",
    Reason: "'new FormControl('')'",
    Notice: "'new FormControl('')'",
    Description: "'new FormControl('')'",
    Name: "'new FormControl('', Validators.required')",
    TerminationDate: " 'new FormControl('', Validators.required')",
  };

  constructor() {}
}
