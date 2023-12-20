import Swordsman from '../characters/Swordsman';

test('Проверяем создание персонажа', () => {
  const char = new Swordsman(1);

  expect(char).toEqual({
    level: 1,
    type: 'swordsman',
    health: 50,
    attack: 40,
    defence: 10,
  });
})
