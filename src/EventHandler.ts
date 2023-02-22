import { Event } from "./Event";

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
    arg: Event
  ) {
    let events = this.listeners.get(event);

    events?.forEach((x) => {
      if (x.predicate !== undefined && !x.predicate(event)) return;

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
          )(clazz, event);
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
