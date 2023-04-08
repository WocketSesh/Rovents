import { Event } from "./Event";
import { EventHandler } from "./EventHandler";

export class RemoteRovent extends Event {
  player?: Player;

  constructor() {
    super();
    this.eventType = "remote";
  }


  fire(player: Player[] | Player | "*" | undefined = undefined) {
    for (let i = 0; i < this.subEvents.size(); i++) {
      let l = this.subEvents[i];
      if (l.eventType === "remote") {
        l.fire(player)
      } else l.fire();
    }
    EventHandler.callRemote(tostring(getmetatable(this)), this, player);

    this.subEvents.clear();
  }

  fireGlobally() {

    for (let i = 0; i < this.subEvents.size(); i++) {
      let l = this.subEvents[i];
      if (l.eventType === "remote") {
        (l as RemoteRovent).fireGlobally();
      }
    }

    EventHandler.callGlobal(tostring(getmetatable(this)), this);
    this.subEvents.clear();
  }


  and(subEvent: RemoteRovent | Event) {
    this.subEvents.push(subEvent);
    return this;
  }
}
