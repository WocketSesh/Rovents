import { EventHandler } from "./EventHandler";

export class Event {
  eventType: "event" | "remote" = "event";

  constructor() { }


  fire() {
    EventHandler.callEvent(tostring(getmetatable(this)), this);
  }
}
