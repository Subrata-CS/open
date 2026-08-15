// title: Text adventure engine
// level: intermediate
// about: Rooms, exits and an inventory — enums and pattern matching turned into a tiny game world.
// tags: enums, matching, ownership

use std::collections::HashMap;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
enum Room { Hall, Library, Cellar, Garden }

#[derive(Debug)]
enum Action { Go(&'static str), Take(&'static str), Look }

struct World {
    here: Room,
    exits: HashMap<Room, Vec<(&'static str, Room)>>,
    items: HashMap<Room, Vec<&'static str>>,
    bag: Vec<&'static str>,
}

impl World {
    fn new() -> Self {
        let mut exits = HashMap::new();
        exits.insert(Room::Hall, vec![("north", Room::Library), ("down", Room::Cellar)]);
        exits.insert(Room::Library, vec![("south", Room::Hall), ("east", Room::Garden)]);
        exits.insert(Room::Cellar, vec![("up", Room::Hall)]);
        exits.insert(Room::Garden, vec![("west", Room::Library)]);

        let mut items = HashMap::new();
        items.insert(Room::Library, vec!["brass key"]);
        items.insert(Room::Cellar, vec!["lantern", "rope"]);

        World { here: Room::Hall, exits, items, bag: Vec::new() }
    }

    fn act(&mut self, action: Action) {
        match action {
            Action::Look => {
                let here = self.here;
                let empty = Vec::new();
                let things = self.items.get(&here).unwrap_or(&empty);
                println!("You are in the {:?}.", here);
                if !things.is_empty() { println!("  You see: {}", things.join(", ")); }
                let ways: Vec<&str> = self.exits[&here].iter().map(|(d, _)| *d).collect();
                println!("  Exits: {}", ways.join(", "));
            }
            Action::Go(dir) => {
                match self.exits[&self.here].iter().find(|(d, _)| *d == dir) {
                    Some((_, room)) => { self.here = *room; println!("You go {} to the {:?}.", dir, room); }
                    None => println!("You cannot go {} from here.", dir),
                }
            }
            Action::Take(item) => {
                let here = self.here;
                if let Some(things) = self.items.get_mut(&here) {
                    if let Some(pos) = things.iter().position(|t| *t == item) {
                        let taken = things.remove(pos);
                        self.bag.push(taken);
                        println!("Taken: {}.", taken);
                        return;
                    }
                }
                println!("There is no {} here.", item);
            }
        }
    }
}

fn main() {
    let mut world = World::new();
    for action in [
        Action::Look,
        Action::Go("north"),
        Action::Take("brass key"),
        Action::Take("sword"),
        Action::Go("east"),
        Action::Look,
    ] {
        world.act(action);
    }
    println!("\nCarrying: {:?}", world.bag);
}
