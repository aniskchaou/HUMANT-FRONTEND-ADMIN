import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import Service from "../interfaces/Service";

@Injectable({
    providedIn: 'root'
})
export default class MemberTestService implements Service {
    public ID = new BehaviorSubject<string>(null);
    _member = [{
        "id": 1, "name": "KCHAOU Anis", "type_id": "Tuteur",
        "email": "kchaou.anis@gmail.com", "mobile": "12312323",
        "address": "60 avenue de colmar", "user_type": "", "password": "", "status": ""
    }]

    static id = 0

    public getAll() {
        return this._member;
    }

    public get(id) {
        return this._member.find(item => item.id === parseInt(id));
    };

    public create(data) {
        data["id"] = MemberTestService.id
        this._member.push(data);
        MemberTestService.id++
        console.log(data)
    };

    public update(data) {

        var foundIndex = this._member.findIndex(item => item.id === data.id);
        this._member[foundIndex] = data;
    };

    public remove(id) {
        var member = this.get(id);

        this._member.splice(this._member.indexOf(member), 1);
    };


}