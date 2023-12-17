import { calcTileType } from '../utils';

test.each([
  [0, 8, 'top-left'],
  [7, 8, 'top-right'],
  [56, 8, 'bottom-left'],
  [63, 8, 'bottom-right'],
  [3, 8, 'top'],
  [5, 8, 'top'],
  [57, 8, 'bottom'],
  [59, 8, 'bottom'],
  [16, 8, 'left'],
  [40, 8, 'left'],
  [31, 8, 'right'],
  [55, 8, 'right'],
  [35, 8, 'center'],
  [53, 8, 'center'],
])('Проверка функции calcTileType', (index, boardSize, result) => {
  expect(calcTileType(index, boardSize)).toBe(result);
})
