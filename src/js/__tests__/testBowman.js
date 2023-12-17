import Bowman from '../characters/Bowman';

test('Проверяем создание персонажа', () => {
  const char = new Bowman(1);

  expect(char).toEqual({
    level: 1,
    type: 'bowman',
    health: 50,
    attack: 25,
    defence: 25,
  });
})
