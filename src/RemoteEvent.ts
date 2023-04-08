import { Event } from "./Event";
import { EventHandler } from "./EventHandler";

export class RemoteRovent extends Event {
  player?: Player;
  constructor() {
    super();
    this.eventType = "remote";
  }


  fire(player: Player[] | Player | "*" | undefined = undefined) {
    EventHandler.callRemote(tostring(getmetatable(this)), this, player);
  }

  fireGlobally() {
    EventHandler.callGlobal(tostring(getmetatable(this)), this);
  }
}
