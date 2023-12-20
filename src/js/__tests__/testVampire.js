import Vampire from '../characters/Vampire';

test('Проверяем создание персонажа', () => {
  const char = new Vampire(1);

  expect(char).toEqual({
    level: 1,
    type: 'vampire',
    health: 50,
    attack: 25,
    defence: 25,
  });
})
