import { normalize, NormalizedResult, schema } from "../../src";

interface Player {
    id: string
    characters: string[]
}

interface Character {
    id: string
    name: string
}

type Entity<T> = { [key: string] : T } | undefined

const characterSchema = new schema.Entity<Character>('characters');
const playerSchema = new schema.Entity<Player>(
    'players',
    { 'characters': characterSchema }
);

const myData = [
    {
        'id': 1,
        'characters': [{'id': 1, 'name': 'Bill'}, {'id': 2, 'name': 'Greg'}]
    },
    {
        'id': 2,
        'characters': [{'id': 3, 'name': 'Sue'}]
    }
];

const result: {result: NormalizedResult[], entities: Record<string, any>} = normalize(myData, [playerSchema]);

const players: Entity<Player> = result.entities.players;
const characters: Entity<Character> = result.entities.characters;
// This prevents check-dts from throwing an error for an unused variable
console.log(players, characters);
