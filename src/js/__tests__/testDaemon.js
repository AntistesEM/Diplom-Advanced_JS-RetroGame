import Daemon from '../characters/Daemon';

test('Проверяем создание персонажа', () => {
  const char = new Daemon(1);

  expect(char).toEqual({
    level: 1,
    type: 'daemon',
    health: 50,
    attack: 10,
    defence: 10,
  });
})
