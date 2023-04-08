# Rovents

shared/events/PlayerDied

```ts
class PlayerDied extends Event {
  constructor(public player: Player) {}
}
```

#### Calling Event

```ts
EventHandler.callEvent(PlayerDied, new PlayerDied(SomePlayer));
```

#### Receiving Event (Static)

Static events only run once on each method they are attached to, and cannot use `this` keyword

```ts
class PlayerListeners {
  @EventHandler.Static(PlayerDied)
  onPlayerDied(event: PlayerDied) {
    print(`${event.Player.Name} died`);
  }
}
```

#### Receiving Event (Instanced)

Classes that you want to be instanced based will require you to add a method call to the constructor
And an optional one to a destructor if you use one.

```ts
@EventHandler.Instanced()
class PlayerListeners {
  someRandomValue: 321;

  constructor() {
    EventHandler.newInstance(this);
  }

  @EventHandler.Instance(PlayerDied)
  onPlayerDied(event: PlayerDied) {
    print(`${event.Player.Name} Died`);
    this.someRandomValue += 1;
  }

  // Optional destructor method call
  // You should call this if your classes are being destroyed 
  destroy() {
    EventHandler.instanceDestroyed();
  }
}
```
