import Character from '../Character';

test('Проверка получения исключения', () => {
  expect(() => new Character(1)).toThrow('Использование "new Character()" недопустимо!');
})
