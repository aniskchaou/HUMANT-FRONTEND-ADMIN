import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import Service from "../interfaces/Service";

@Injectable({
    providedIn: 'root'
})
export default class MemberTypeTestService implements Service {

    public ID = new BehaviorSubject<string>(null);
    _memberType = [{ "id": 1, "member_type_name": "Auteur" }]
    static id = 0

    public getAll() {
        return this._memberType;
    }

    public get(id) {
        return this._memberType.find(item => item.id === parseInt(id));
    };

    public create(data) {
        data["id"] = MemberTypeTestService.id
        this._memberType.push(data);
        MemberTypeTestService.id++
        console.log(data)
    };

    public update(data) {

        var foundIndex = this._memberType.findIndex(item => item.id === parseInt(data.id));
        this._memberType[foundIndex] = data;
    };

    public remove(id) {
        var memberType = this.get(id);
        this._memberType.splice(this._memberType.indexOf(memberType), 1);
    };


}