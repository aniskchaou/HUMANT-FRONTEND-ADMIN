import { Injectable } from "@angular/core";
import Service from "../interfaces/Service";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export default class BookTestService implements Service {
    public ID = new BehaviorSubject<string>(null);
    _book = [{
        "id": 1, "isbn": "9782330119478", "title": "VIVRE AVEC LA TERRE", "author": "Charles et Perrine Hervé - Gruyer",
        "edition": "Editions Actes Sud", "year_edition": "2020", "date": "24 / 11 / 2020",
        "edition_year": "string",
        "number_of_books": "string",
        "photo": "string",
        "physical_form": "string",
        "publisher": "string",
        "series": "string",
        "size": "string",
        "price": "string",
        "call_no": "string",
        "location": "string",
        "clue_page": "string",
        "editor": "string",
        "publishing_year": "string",
        "publication_place": "string",
        "number_of_pages": "string",
        "source_details": "string",
        "notes": "string",
        "pdf": "string",
        "subtitle": "",
        "link": ""
    }]


    static id = 0

    public getAll() {
        return this._book;
    }

    public get(id) {
        return this._book.find(item => item.id === parseInt(id));
    };

    public create(data) {
        BookTestService.id++
        data["id"] = BookTestService.id
        this._book.push(data);
    };

    public update(data) {

        var foundIndex = this._book.findIndex(item => item.id === data.id);
        this._book[foundIndex] = data;
    };

    public remove(id) {

        var book = this.get(id);

        this._book.splice(this._book.indexOf(book), 1);

    };


}