import {Injectable} from "@angular/core";
import {WebSocketConnectionService} from "../../web-socket-connection.service";
import {ClientWantsToGetDeviceByIdDto} from "../../../models/ClientWantsToGetDeviceByIdDto";
import {Observable} from "rxjs";
import {Device} from "../../../models/Entities";

@Injectable({providedIn: 'root'})
export class DeviceService {

  constructor(private ws: WebSocketConnectionService) {
  }

  getDeviceById(id: number){
    var dto = new ClientWantsToGetDeviceByIdDto({
      DeviceId: id
    });
    this.ws.socketConnection.sendDto(dto)
  }

  getDeviceObservable() {
    return this.ws.device;
  }
}
