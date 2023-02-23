import { Event } from "./Event";
import { RemoteRovent } from "./RemoteEvent";

export type ExtraOpts = {
  predicate: (event: Event) => boolean;
};

export class EventHandler {
  static listeners = new Map<
    new (...args: any[]) => {},
    {
      clazz: {};
      propertyKey: string;
      eventType: "static" | "instance";
      predicate?: (event: Event) => boolean;
    }[]
  >();

  static clazzInstances = new Map<string, {}[]>();
  static clientConnections = new Map<string, RBXScriptConnection>();
  static serverConnections = new Map<string, RBXScriptConnection>();

  static newInstance(name: string, instance: {}) {
    let clazzes = this.clazzInstances.get(name);

    if (!clazzes)
      return error(
        `Attempt to store new instance of ${name}, but this class is not Instanced.`
      );
    else clazzes.push(instance);
  }

  static instanceDestroyed(name: string, instance: {}) {
    let clazzes = this.clazzInstances.get(name);

    if (!clazzes) return;
    else clazzes.remove(clazzes.indexOf(instance));
  }

  static callEvent<T extends new (...args: any[]) => Event>(
    event: T,
    arg: Event,
    wasFiredInternally: boolean = false
  ) {
    if (!wasFiredInternally && new event().eventType === "remote") {
      let rEvent = game
        .GetService("ReplicatedStorage")
        .FindFirstChild(tostring(event), true);

      if (!rEvent) {
        error(
          `Attempt to call remote event but could not find ${tostring(
            event
          )} in Replicated Storage`
        );

        return;
      }
      if (game.GetService("RunService").IsServer()) {
        (rEvent as RemoteEvent).FireClient((arg as RemoteRovent).player, arg);
      } else if (game.GetService("RunService").IsClient()) {
        (rEvent as RemoteEvent).FireServer(arg);
      }

      return;
    }

    let events = this.listeners.get(event);

    events?.forEach((x) => {
      if (x.predicate !== undefined && !x.predicate(arg)) return;

      if (x.eventType === "static") {
        (
          x.clazz[x.propertyKey as keyof typeof x.clazz] as (
            self: typeof x.clazz,
            arg: Event
          ) => void
        )(x.clazz, arg);
      } else if (x.eventType === "instance") {
        let clazzes = this.clazzInstances.get(tostring(x.clazz));
        if (!clazzes)
          return error(
            "Tried to use instanced event, but class is not instanced."
          );

        clazzes.forEach((clazz) => {
          (
            clazz[x.propertyKey as keyof typeof clazz] as (
              self: typeof clazz,
              arg: Event
            ) => void
          )(clazz, arg);
        });
      }
    });
  }

  static Instanced() {
    return function (target: {}) {
      EventHandler.clazzInstances.set(tostring(target), []);
    };
  }

  //idk if thes ecan just call Listen since its also a decorator
  static Instance<T extends new (...args: any[]) => Event>(
    event: T,
    opts?: ExtraOpts
  ) {
    return function (
      target: {},
      propertyKey: string,
      descriptor: TypedPropertyDescriptor<{}>
    ) {
      EventHandler.addListener(
        event,
        "instance",
        opts,
        target,
        propertyKey,
        descriptor
      );

      return descriptor;
    };
  }

  static Static<T extends new (...args: any[]) => Event>(
    event: T,
    opts?: ExtraOpts
  ) {
    return function (
      target: {},
      propertyKey: string,
      descriptor: TypedPropertyDescriptor<{}>
    ) {
      EventHandler.addListener(
        event,
        "static",
        opts,
        target,
        propertyKey,
        descriptor
      );

      return descriptor;
    };
  }

  static addListener<T extends new (...args: any[]) => Event>(
    event: T,
    eventType: "static" | "instance",
    opts: ExtraOpts | undefined = undefined,
    target: {},
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<{}>
  ) {
    let events = EventHandler.listeners.get(event);

    let dt = {
      clazz: target,
      propertyKey: propertyKey,
      eventType: eventType,
      predicate: opts?.predicate,
    };

    if (!events) {
      EventHandler.listeners.set(event, [dt]);
    } else {
      events.push(dt);
    }

    if (new event().eventType === "remote") {
      let remoteEvent = game
        .GetService("ReplicatedStorage")
        .FindFirstChild(tostring(event), true);

      //No way to check if it actually is a remote event?? useful woo
      if (!remoteEvent) {
        error(
          `Attempt to use ${tostring(
            event
          )} as a remote event, but could not find RemoteEvent in ReplicatedStorage.`
        );
        return;
      }

      if (game.GetService("RunService").IsServer()) {
        if (EventHandler.serverConnections.get(tostring(event))) return;

        let scon = (remoteEvent as RemoteEvent).OnServerEvent.Connect(
          (player, ...args) => {
            EventHandler.callEvent(event, args[0] as Event, true);
          }
        );

        EventHandler.clientConnections.set(tostring(event), scon);
      } else if (game.GetService("RunService").IsClient()) {
        if (EventHandler.clientConnections.get(tostring(event))) return;

        let ccon = (remoteEvent as RemoteEvent).OnClientEvent.Connect(
          (...args: unknown[]) => {
            EventHandler.callEvent(event, args[0] as Event, true);
          }
        );

        EventHandler.clientConnections.set(tostring(event), ccon);
      }
    }
  }

  static Listener<T extends new (...args: any[]) => Event>(
    event: T,
    eventType: "static" | "instance",
    opts?: ExtraOpts
  ) {
    return function (
      target: {},
      propertyKey: string,
      descriptor: TypedPropertyDescriptor<{}>
    ) {
      EventHandler.addListener(
        event,
        eventType,
        opts,
        target,
        propertyKey,
        descriptor
      );

      return descriptor;
    };
  }
}
