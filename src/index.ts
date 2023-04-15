import { Event } from "./Event";
import { EventHandler } from "./EventHandler";
import { RemoteRovent } from "./RemoteEvent";
import { Replica } from "./Replica";
export { Event, EventHandler, RemoteRovent, Replica };

//Shared

let Replicas = new Replica({
  pets: [],
  coins: 0,
  zones: 0,
});

//Client

class SomeController {
  @Replicas.Listen("coins")
  coins = 0;

  @Replicas.ListenMethod("pets")
  petsChanged(pets: []) {
    for (let i = 0; i < pets.size(); i++) {
      //update ui or some shit
    }
  }
}
