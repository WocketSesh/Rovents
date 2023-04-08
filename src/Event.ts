import { EventHandler } from "./EventHandler";
import { RemoteRovent } from "./RemoteEvent";

export class Event {
  eventType: "event" | "remote" = "event";
  // Event can only have subEvents of type Event
  // Unlike RemoteRovent which can have either
  // This is because you cant specify who you to fire to with a normal Event so it fires client -> client server -> server
  // So either do a global fire
  // Or do RemoteRovet.and(Event).fire(player) and invert the calls
  subEvents: (Event | RemoteRovent)[] = []


  constructor() { }


  fire() {
    for (let i = 0; i < this.subEvents.size(); i++) {
      this.subEvents[i].fire();
    }
    EventHandler.callEvent(tostring(getmetatable(this)), this);
    this.subEvents.clear();
  }


  and(subEvent: Event) {
    this.subEvents.push(subEvent);
    return this;
  }
}
