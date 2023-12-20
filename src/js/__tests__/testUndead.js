import Undead from '../characters/Undead';

test('Проверяем создание персонажа', () => {
  const char = new Undead(1);

  expect(char).toEqual({
    level: 1,
    type: 'undead',
    health: 50,
    attack: 40,
    defence: 10,
  });
})
