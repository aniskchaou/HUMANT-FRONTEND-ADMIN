import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import Service from "../interfaces/Service";

@Injectable({
    providedIn: 'root'
})
export default class CategoryTestService implements Service {
    public ID = new BehaviorSubject<string>(null);
    _category = [{ "id": 1, "category_name": "science" }, { "id": 3, "category_name": "roman" }]
    static id = 0

    public getAll() {
        return this._category;
    }

    public get(id) {
        return this._category.find(item => item.id === parseInt(id));
    };

    public create(data) {
        data["id"] = CategoryTestService.id
        this._category.push(data);
        CategoryTestService.id++
    };

    public update(data) {

        var foundIndex = this._category.findIndex(item => item.id === parseInt(data.id));
        this._category[foundIndex] = data;
    };

    public remove(id) {
        var category = this.get(id);

        this._category.splice(this._category.indexOf(category), 1);
    };


}