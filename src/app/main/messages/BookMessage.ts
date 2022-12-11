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
    isbn: 'ISBN  is required.',
    title: 'Title is required.',
    writer: 'Author is required .',
    edition: 'Edition is required.',
    edition_year: 'Edition year is required.',
    photo: ' Photo  is required.',
    physical_form: 'Physical form is required.',
    publisher: ' Publisher  is required.',
    publishing_year: 'Publication year  is required.',
    publication_place: 'Publication place is required.',
    number_of_pages: ' Number of pages is required.',
    notes: ' Note  is required.',
    status: ' Status file  is required.',
  };

  constructor() {}
}
