import { Event } from "./Event";
import { EventHandler } from "./EventHandler";
import { RemoteRovent } from "./RemoteEvent";
import { Replica } from "./Replica";
export { Event, EventHandler, RemoteRovent, Replica };

//Shared

let Replicas = new Replica({
  pets: [] as number[],
  otherarr: [] as string[],
  coins: 0,
  zones: 0,
});

Replicas.pushArray("pets", 123);
Replicas.pushArray("otherarr", "yooo");
