# Rovents
Meant to be used with: https://github.com/roblox-ts/roblox-ts

`npm i @shagos/rovents`

shared/events/PlayerDied

```ts
class PlayerDied extends Event {
  constructor(public player: Player) {}
}
```

#### Calling Event

1.
```ts
EventHandler.callEvent(PlayerDied, new PlayerDied(SomePlayer));
```

2.
```ts
new PlayerDied(SomePlayer).fire()
````

#### Calling RemoteRovent 

```ts
// Leave Player param empty if calling client -> server
EventHandler.callRemote(PlayerDied, new PlayerDied(SomePlayer), player | [player1, player2] | "*")

new PlayerDied(SomePlayer).fire(player | [player1, player2] | "*")

// fireGlobally will fire the remote rovent as well as call the event client -> client server -> server
// So if you have listeners for this on the client and call this from the client, it will call those events as well as the server events
new PlayerDied(SomePlayer).fireGlobally()
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


### Replicas

Replicas can be used to bind a client side value to a server side value and have it be automatically updated

```ts
// Shared
const Replicas = new Replica({money: 0})

// Server
// set takes in a partial, so you can update as many values as you want in a single call
Replicas.set(player, {money: 100})
Replicas.get(player).money // 100


// Client
class SomeController {
    // This will be automatically updated when the value is updated on server side
    @Replicas.Listen("money")
    money = 0;

    constructor() {
      // We need to call this so each instance of this class can be tracked, even if the class is a singleton
      EventHandler.newInstance(this)
    }
}
```

You can have multiple Replica classes active, but they will most likely conflict with each other and is not recommended
If you Listen to money on multiple classes / instances, they will all hold the same value
You will not be able to use this to track multiple values of money on the client side, since each client is tied to 1 value of money
