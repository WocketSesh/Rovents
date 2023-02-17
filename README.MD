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

Classes that contain an instanced event require `@EventHandler.Instanced()` decorator.
Instanced events will run on each instance of that class that has been instantiated

```ts
@EventHandler.Instanced()
class PlayerListeners {
  someRandomValue: 321;

  @EventHandler.Instance(PlayerDied)
  onPlayerDied(event: PlayerDied) {
    print(`${event.Player.Name} Died`);
    this.someRandomValue += 1;
  }
}
```
