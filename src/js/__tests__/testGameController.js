import GameController from '../GameController';
import Bowman from '../characters/Bowman';

test('Проверка метода characterInfo на корректность вывода характеристик', () => {
  const char = new Bowman(2);
  const tooltip = GameController.characterInfo(char);
  console.log('2222222', tooltip);
  expect(tooltip).toBe(`\u{1F396}2 \u{2694}25 \u{1F6E1}25 \u{2764}50`)
})
