// ! еще вариант поиска соседних клеток в радиусе 1
function getNeighbors(index) {
  const neighbors = [];

  // Получаем текущие координаты клетки
  const x = index % 8;
  const y = Math.floor(index / 8);

  // Проверяем верхнюю соседнюю клетку
  if (y > 0) {
      neighbors.push(index - 8);
      
      // Проверяем верхнюю левую соседнюю клетку
      if (x > 0) {
          neighbors.push(index - 9);
      }
      
      // Проверяем верхнюю правую соседнюю клетку
      if (x < 7) {
          neighbors.push(index - 7);
      }
  }
  
  // Проверяем нижнюю соседнюю клетку
  if (y < 7) {
      neighbors.push(index + 8);
      
      // Проверяем нижнюю левую соседнюю клетку
      if (x > 0) {
          neighbors.push(index + 7);
      }
      
      // Проверяем нижнюю правую соседнюю клетку
      if (x < 7) {
          neighbors.push(index + 9);
      }
  }
  
  // Проверяем левую соседнюю клетку
  if (x > 0) {
      neighbors.push(index - 1);
  }
  
  // Проверяем правую соседнюю клетку
  if (x < 7) {
      neighbors.push(index + 1);
  }
  
  return neighbors;
}
