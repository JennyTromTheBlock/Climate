import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {Device} from "../../../../models/device";
import {Subject, takeUntil} from "rxjs";
import {DeviceInRoom} from "../../../../models/Entities";
import {DeviceService} from "../../devices/device.service";
import {RoomService} from "../room.service";
import {WebSocketConnectionService} from "../../../web-socket-connection.service";
import {Room} from "../../../../models/room";
import {OverlayEventDetail} from "@ionic/core/components";
import {IonModal} from "@ionic/angular";

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./../rooms.component.scss'],
})
export class RoomComponent implements OnInit {
  specificRoom!: Room;
  devices: Device[] = [{deviceId: 1}, {deviceId: 2}, {deviceId: 3}];
  deviceName?: string;
  roomName?: string;

  public alertButtons = [
    {
      text: 'Cancel',
      role: 'cancel',
      handler: () => {
        console.log('Alert canceled');
      },
    },
    {
      text: 'Delete',
      role: 'confirm',
      handler: () => {
        this.roomService.deleteRoom(this.specificRoom.Id!)
        this.router.navigate(['/rooms/all']);
        console.log('Alert confirmed');
        this.modal.dismiss(null, 'cancel');
      },
    },
  ];
  idFromRoute: number | undefined;
  private unsubscribe$ = new Subject<void>();
  roomDevices?: DeviceInRoom[];

  constructor(private activatedRoute: ActivatedRoute,
              private deviceService: DeviceService,
              private roomService: RoomService,
              private ws: WebSocketConnectionService,
              private router: Router
  ) {
  }

  ngOnInit() {
    this.getRoomFromRoute()
    this.getDevicesFromRoute();
    this.subscribeToRoomDevices();
    this.subscribeToRooms()
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getRoomFromRoute() {
    this.idFromRoute = +this.activatedRoute.snapshot.params['id'];
    this.roomService.getRoomById(this.idFromRoute)
  }

  getDevicesFromRoute() {
    this.idFromRoute = +this.activatedRoute.snapshot.params['id'];
    this.deviceService.getDevicesByRoomId(this.idFromRoute)
  }

  subscribeToRoomDevices() {
    this.deviceService.getRoomDevicesObservable()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(d => {
        if (d) {
          this.roomDevices = d;
        }
      });
  }

  subscribeToRooms() {
    this.ws.specificRoom
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(theSpecificRoom => {
        if (!theSpecificRoom){
          throw new Error();
        }
        this.specificRoom = theSpecificRoom;
      });
  }

  @ViewChild(IonModal) modal!: IonModal;

  onWillDismiss($event: any) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      console.log("Changing the name from " + this.specificRoom.RoomName + " to " + this.roomName)
      this.roomService.editRoom(this.roomName!, this.specificRoom.Id);
    }
  }

  confirm() {
    this.modal.dismiss(null, 'confirm');

  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }
}
