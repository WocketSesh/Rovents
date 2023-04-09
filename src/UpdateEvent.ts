import { RemoteRovent } from "./RemoteEvent";

export class UpdateEvent<T> extends RemoteRovent {
  constructor(public data: Partial<T>, public player: Player) {
    super();
  }
}
