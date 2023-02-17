import { Event } from "./Event";


export class EventHandler {
  static listeners = new Map<
    new (...args: any[]) => {},
    { clazz: {}; propertyKey: string; eventType: "static" | "instance" }[]
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

  static Instance<T extends new (...args: any[]) => Event>(event: T) {
    return function (
      target: {},
      propertyKey: string,
      descriptor: TypedPropertyDescriptor<{}>
    ) {
      let events = EventHandler.listeners.get(event);

      let dt = {
        clazz: target,
        propertyKey: propertyKey,
        eventType: "instance",
      } as const;

      if (!events) {
        EventHandler.listeners.set(event, [dt]);
      } else {
        events.push(dt);
      }

      return descriptor;
    };
  }

  static Static<T extends new (...args: any[]) => Event>(event: T) {
    return function (
      target: {},
      propertyKey: string,
      descriptor: TypedPropertyDescriptor<{}>
    ) {
      let events = EventHandler.listeners.get(event);

      let dt = {
        clazz: target,
        propertyKey: propertyKey,
        eventType: "static",
      } as const;

      if (!events) {
        EventHandler.listeners.set(event, [dt]);
      } else {
        events.push(dt);
      }

      return descriptor;
    };
  }

  static Listener<T extends new (...args: any[]) => Event>(
    event: T,
    eventType: "static" | "instance"
  ) {
    return function (
      target: {},
      propertyKey: string,
      descriptor: TypedPropertyDescriptor<{}>
    ) {
      let events = EventHandler.listeners.get(event);

      let dt = {
        clazz: target,
        propertyKey: propertyKey,
        eventType: eventType,
      };

      if (!events) {
        EventHandler.listeners.set(event, [dt]);
      } else {
        events.push(dt);
      }

      return descriptor;
    };
  }
}
