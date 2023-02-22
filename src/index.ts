import { Event } from "./Event";
import { EventHandler } from "./EventHandler";

export { Event, EventHandler };

class test extends Event {
  public name: string = "yo";
}

class test2 {
  @EventHandler.Static(test, {
    predicate: (event) => {
      return true;
    },
  })
  test() {}
}
