import { Event } from "./Event";

export class RemoteRovent extends Event {
  player?: Player;
  constructor() {
    super();
    this.eventType = "remote";
  }
}
