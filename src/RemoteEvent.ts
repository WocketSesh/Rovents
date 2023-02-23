import { Event } from "./Event";

export class RemoteRovent extends Event {
  constructor(public player: Player) {
    super();
    this.eventType = "remote";
  }
}
