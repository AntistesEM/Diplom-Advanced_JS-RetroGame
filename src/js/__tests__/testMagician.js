import Magician from '../characters/Magician';

test('Проверяем создание персонажа', () => {
  const char = new Magician(1);

  expect(char).toEqual({
    level: 1,
    type: 'magician',
    health: 50,
    attack: 10,
    defence: 40,
  });
})
