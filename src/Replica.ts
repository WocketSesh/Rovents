import { EventHandler } from "./EventHandler";
import { UpdateEvent } from "./UpdateEvent";

export class Replica<T extends {}> {
  data: Map<Player, T> = new Map();
  replicaListeners: Map<keyof T, { clazz: string; property: string }[]> =
    new Map();
  replicaMethodListeners: Map<keyof T, { clazz: string; method: string }[]> =
    new Map();

  constructor(public values: T) {
    EventHandler.newInstance(this);
  }

  initPlayer(player: Player, values?: T) {
    this.set(player, values || this.cloneTable(this.values));
  }

  playerLeft(player: Player) {
    this.data.delete(player);
  }

  set(player: Player, x: Partial<T>) {
    if (game.GetService("RunService").IsClient()) {
      warn("Cannot do Replica.set on client side.");
      return;
    }

    let d = this.data.get(player);

    if (!d) {
      d = this.cloneTable(this.values);
      this.i_set(d, x);
      this.data.set(player, d);
    } else {
      this.i_set(d, x);
    }

    new UpdateEvent(x, player).fire(player);
  }

  private i_set(oldD: Partial<T>, newD: Partial<T>) {
    for (let [i, v] of pairs(newD)) {
      oldD[i as keyof T] = newD[i as keyof T];
    }
  }

  //Does not preserve metatables, dont think we need to care about them in this case?
  cloneTable<T extends object>(t: T): T {
    let x: Partial<T> = {};

    for (let [i, v] of pairs(t)) {
      if (typeIs(v, "table")) {
        x[i as keyof T] = this.cloneTable(v) as T[keyof T];
      } else x[i as keyof T] = v;
    }

    return x as T;
  }

  get(player?: Player): T | undefined {
    if (player === undefined && game.GetService("RunService").IsServer()) {
      warn(
        "When doing Replica.get on server side you must provide a valid player argument."
      );
      return undefined;
    } else if (player === undefined)
      player = game.GetService("Players").LocalPlayer;

    return this.data.get(player);
  }

  @EventHandler.Instance(UpdateEvent)
  update(event: UpdateEvent<T>) {
    if (game.GetService("RunService").IsServer()) {
      warn("Attempt to call Replica.update on server side.");
      return;
    }

    // event.player should always just be LocalPlayer, but just incase
    this.data.set(event.player, event.data as T);

    if (event.player !== game.GetService("Players").LocalPlayer) return;

    for (let [i, v] of pairs(event.data as Partial<T>)) {
      let x = this.replicaListeners.get(i as keyof T);
      if (x) {
        for (let ii = 0; ii < x.size(); ii++) {
          let c = x[ii];
          let instances = EventHandler.clazzInstances.get(c.clazz);
          if (!instances) continue;

          this.updateProperties(instances, c.property, v);
        }
      }

      let y = this.replicaMethodListeners.get(i as keyof T);

      if (!y) continue;

      for (let ii = 0; ii < y.size(); ii++) {
        let c = y[ii];
        let instances = EventHandler.clazzInstances.get(c.clazz);
        if (!instances) continue;

        this.callMethods(instances, c.method, v);
      }
    }
  }

  updateProperties<T extends {}>(
    instances: T[],
    property: string,
    value: unknown
  ) {
    for (let i = 0; i < instances.size(); i++) {
      instances[i][property as keyof T] = value as T[keyof T];
    }
  }

  callMethods<T extends {}>(instances: T[], method: string, value: unknown) {
    for (let i = 0; i < instances.size(); i++) {
      (
        instances[i][method as keyof T] as (self: unknown, arg: unknown) => void
      )(instances[i], value);
    }
  }

  Listen(value: keyof T) {
    let replica = this;
    return function (target: {}, key: string) {
      if (game.GetService("RunService").IsServer()) {
        warn("You cannot listen to replica values on server side.");
        return;
      }

      let x = tostring(target);
      let y = replica.replicaListeners.get(value);

      (y && y.push({ property: key, clazz: x })) ||
        replica.replicaListeners.set(value, [{ property: key, clazz: x }]);
    };
  }

  ListenMethod(value: keyof T) {
    let replica = this;
    return function (target: {}, key: string, descriptor: {}) {
      if (game.GetService("RunService").IsServer()) {
        warn("You cannot use ListenMethod on server side.");
        return;
      }

      let x = tostring(target);
      let y = replica.replicaMethodListeners.get(value);

      (y && y.push({ method: key, clazz: x })) ||
        replica.replicaMethodListeners.set(value, [{ method: key, clazz: x }]);
    };
  }
}
