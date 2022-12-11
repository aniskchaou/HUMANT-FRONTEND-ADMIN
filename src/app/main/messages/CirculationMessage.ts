import { Injectable } from '@angular/core';
import CONFIG from '../urls/urls';

@Injectable({
  providedIn: 'root',
})
export default class CirculationMessage {
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
    memberName: 'Member Name  is required.',
    bookName: 'Book name is required.',
    writer: 'Wrirer is required.',
    issueDate: 'Issue Date is required .',
    lastDate: 'Last Date is required.',
    toReturn: 'To Return year is required.',
    returnDate: 'Return Date of books is required.',
    penalty: ' Panalty  is required.',
    returnStatus: 'Return Status form is required.',
  };

  constructor() {}
}
