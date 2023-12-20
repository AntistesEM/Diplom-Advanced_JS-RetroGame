import { characterGenerator, generateTeam } from '../generators';
import Bowman from '../characters/Bowman';
import Swordsman from '../characters/Swordsman';
import Magician from '../characters/Magician';

test('Проверяем, выдаёт ли генератор characterGenerator бесконечно новые персонажи из списка allowedTypes на примере 100 персонажей', () => {
  const allowedTypes = [Bowman, Swordsman, Magician];
  const maxLevel = 4;
  const generator = characterGenerator(allowedTypes, maxLevel);
  const characters = [];

  for (let index = 0; index < 100; index++) {
    const character = generator.next().value;
    characters.push(character);
  }

  expect(characters.length).toBe(100);
})

test('Проверяем, в нужном ли количестве и диапазоне уровней (учёт аргумента maxLevel) создаются персонажи при вызове generateTeam', () => {
  const allowedTypes = [Bowman, Swordsman, Magician];
  const maxLevel = 4;
  const characterCount = 5;
  const team = generateTeam(allowedTypes, maxLevel, characterCount);

  expect(team.characters.length).toBe(characterCount);
  for (const iterator of team.characters) {
    expect(iterator.level).toBeLessThanOrEqual(maxLevel);
  }
})
