import Team from './js/Team';

/**
 * Формирует экземпляр персонажа из массива allowedTypes со
 * случайным уровнем от 1 до maxLevel
 *
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @returns генератор, который при каждом вызове
 * возвращает новый экземпляр класса персонажа
 *
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  // TODO: write logic here
  while (true) {
    const indexArray = Math.floor(Math.random() * allowedTypes.length);
    const level = Math.floor(Math.random() * maxLevel) + 1;

    const CharacterClass = allowedTypes[indexArray];
    const character = new CharacterClass(level);

    yield character;
  }
}

/**
 * Формирует массив персонажей на основе characterGenerator
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @param characterCount количество персонажей, которое нужно сформировать
 * @returns экземпляр Team, хранящий экземпляры персонажей. Количество персонажей в команде - characterCount
 * */
export function generateTeam(allowedTypes, maxLevel, characterCount) {
  // TODO: write logic here
  let lst = [];
  const char = characterGenerator(allowedTypes, maxLevel)
  for (let index = 0; index < characterCount; index++) {  
    lst.push(char.next().value)
  }
  
  return new Team(lst)
}
