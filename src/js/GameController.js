import themes from "./themes";
import PositionedCharacter from './PositionedCharacter';
import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Magician from './characters/Magician';
import Vampire from './characters/Vampire';
import Undead from './characters/Undead';
import Daemon from './characters/Daemon';
import { generateTeam } from './generators';
import cursors from './cursors';
import GamePlay from "./GamePlay";
import GameState from './GameState';
import Node from './Node';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.countTeam = 0;
    this.maxLevel = 4;
    this.userTypes = [Bowman, Swordsman, Magician];
    this.enemyTypes = [Vampire, Undead, Daemon];
    this.userTeam = [];
    this.enemyTeam = [];
    [this.userPositions, this.enemyPositions] = this.arrayPosition();
    this.positionedCharactersUser = [];
    this.positionedCharactersAll = [];
    this.indexSelectedGreen = -1;
    this.indexSelectedYellow = -1;
    this.indexSelectedRed = -1;
    this.currentThemeIndex = 0;
    this.nextStep = true;
    this.gameWin = false;
    this.gameOver = false;
  }

  init() {
    if (this.currentThemeIndex >= Object.values(themes).length) {
      this.currentThemeIndex = 0;
      this.gameOver = true;
      GamePlay.showMessage('Игра закончена! Запустите новую игру.')
    } 
    
    if (this.countTeam === 0) {
      this.countTeam = 2 // Math.floor(Math.random() * 5) + 1; // случайное количество героев от 1 до 6
    
      this.userTeam = generateTeam(this.userTypes, this.maxLevel, this.countTeam); // команда игрока

      this.enemyTeam = generateTeam(this.enemyTypes, this.maxLevel, this.countTeam); // команда противника

      this.positionedCharactersUser = this.positionedCharacters(this.userPositions, this.userTeam); // массив объектов PositionedCharacter для игрока
    
      const positionedCharactersEnemy = this.positionedCharacters(this.enemyPositions, this.enemyTeam); // массив объектов PositionedCharacter для противника
    
      if (!this.gameOver) {
        this.positionedCharactersAll = this.positionedCharactersUser.concat(positionedCharactersEnemy); // объединение массивов объектов PositionedCharacter
      }

      // увеличиваем характеристики всех персонажей в зависимости от уровня
      this.positionedCharactersAll.forEach((pos) => {
        if (pos.character.level > 1) {
          const level = pos.character.level;
          pos.character.level = 1;

          for (let index = 0; index < level - 1; index++) {
            this.levelUp(pos.character);          
          }
        }
      })
    } else {
      this.enemyTeam = generateTeam(this.enemyTypes, this.maxLevel, this.countTeam); // команда противника

      this.positionedCharactersUser = this.positionedCharacters(this.userPositions, this.userTeam); // массив объектов PositionedCharacter для игрока
      
      const positionedCharactersEnemy = this.positionedCharacters(this.enemyPositions, this.enemyTeam); // массив объектов PositionedCharacter для противника

      // увеличиваем характеристики персонажей противника в зависимости от уровня
      positionedCharactersEnemy.forEach((pos) => {
        if (pos.character.level > 1) {
          const level = pos.character.level;
          pos.character.level = 1;
          for (let index = 0; index < level; index++) {
            this.levelUp(pos.character);          
          }
        }
      })

      if (!this.gameOver) {
        this.positionedCharactersAll = this.positionedCharactersUser.concat(positionedCharactersEnemy); // объединение массивов объектов PositionedCharacter
      }
    }

    const currentTheme = Object.values(themes)[this.currentThemeIndex];
    this.gamePlay.drawUi(currentTheme); // отрисовка поля
    if (!this.gameOver) {
      this.gamePlay.redrawPositions(this.positionedCharactersAll); // отрисовка героев на поле
      this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
      this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    } 

    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
  }

  onCellClick(index) {
    // TODO: react to click 
    if (!this.gameOver) {
      const foundCharacter = this.positionedCharactersAll.find((character) => character.position === this.indexSelectedYellow);
      
      if (this.gamePlay.cells[index].children.length !== 0) {
        this.indexSelectedRed = this.gamePlay.cells.findIndex((item) => item.classList.contains('selected-red'));

        if (this.userTypes.find((item) => item.name === this.characterType(index))) {

          if (this.indexSelectedYellow !== -1) {
            this.gamePlay.deselectCell(this.indexSelectedYellow);
          }

          this.gamePlay.selectCell(index);
        } else if (this.indexSelectedYellow !== -1) {
          if (this.indexSelectedRed !== -1) {
            const target = this.positionedCharactersAll.find((character) => character.position === this.indexSelectedRed);
            const damage = Math.round(Math.max(foundCharacter.character.attack - target.character.defence, foundCharacter.character.attack * 0.1));

            target.character.health = target.character.health - damage;

            this.gamePlay.showDamage(index, damage)
              .then(() => {
                this.removeCharacter(target, index);
                this.gamePlay.redrawPositions(this.positionedCharactersAll);

                // если игрок победил 
                if (this.gameWin) {
                  this.nextStep = true;
                  this.gameWin = false;
                } else {
                  this.nextStep = false;
                }

                this.computerAction();
              });
            
          } else {
            GamePlay.showError('Вы не можете атаковать из данной позиции!');
          }
        } else {
          GamePlay.showError('Это не ваш персонаж!');
        }
      } else if (this.indexSelectedYellow !== -1 && this.gamePlay.boardEl.style.cursor === 'pointer') {

        if (foundCharacter) {
          foundCharacter.position = index;
        }

        this.gamePlay.redrawPositions(this.positionedCharactersAll);
        this.gamePlay.deselectCell(this.indexSelectedYellow);
        this.gamePlay.selectCell(index);
        this.nextStep = false;
        this.computerAction();
      }
    }
  }

  /**
   * Метод для проверки наличия персонажей в командах
   */
  checkTeam() {
    const enemyArr = this.enemyTeam.characters.map((el) => el.constructor.name)
    const userArr = this.userTeam.characters.map((el) => el.constructor.name)
    let enemy = 0;
    let user = 0;

    this.positionedCharactersAll.forEach((pos) => {
      if (enemyArr.includes(pos.character.constructor.name)) {
        enemy = enemy + 1;
      } else if (userArr.includes(pos.character.constructor.name)) {
        user = user + 1;
      }
    })

    if (enemy === 0) {
      this.currentThemeIndex++;

      if (this.currentThemeIndex < Object.values(themes).length) {
        GamePlay.showMessage('Вы выиграли!');
      }
      
      this.countTeam = this.userTeam.characters.length;

      this.userTeam.characters.forEach((char) => {

        if (char.health <= 0) {
          char.health = 10;
        }

        this.levelUp(char)
      })
      this.gameWin = true;
      
      this.clearCellListeners();
      this.init();
      
    } else if (user === 0) {
      GamePlay.showMessage('Вы проиграли!');
      this.countTeam = 0;
      this.gameOver = true;
      this.currentThemeIndex = 0;
      this.clearCellListeners();
      this.init();
    }
  }

  /**
   * Метод для увеличения уровня и характеристик
   * @param {obj} character - персонаж
   */
  levelUp(character) {
    character.attack = Math.max(character.attack, character.attack * (80 + character.health) / 100);
    character.defence = Math.max(character.defence, character.defence * (80 + character.health) / 100);

    if (character.health > 20) {
      character.level++;
    }    

    character.health = character.health + 80;
      if (character.health > 100) {
        character.health = 100;
      }
  }

  onCellEnter(index) {
    if (!this.gameOver) {
      this.indexSelectedGreen = this.gamePlay.cells.findIndex((item) => item.classList.contains('selected-green'));
      this.indexSelectedYellow = this.gamePlay.cells.findIndex((item) => item.classList.contains('selected-yellow'));
      this.indexSelectedRed = this.gamePlay.cells.findIndex((item) => item.classList.contains('selected-red'));

      if (this.gamePlay.cells[index].children.length !== 0) {
        const character = this.positionedCharactersAll.find((item) => item.position === index);
        const tooltip = GameController.characterInfo(character.character);

        if (this.indexSelectedGreen !== -1) {
          this.gamePlay.deselectCell(this.indexSelectedGreen);
        } else if (this.indexSelectedRed !== -1) {
          this.gamePlay.deselectCell(this.indexSelectedRed);
        }

        this.gamePlay.showCellTooltip(tooltip, index);

        if (this.userTypes.find((item) => item.name === this.characterType(index))) {
          this.gamePlay.setCursor(cursors.pointer);
        } else if (this.enemyTypes.find((item) => item.name === this.characterType(index))) {

          if (this.indexSelectedYellow !== -1) {
            const neighbourCellsAttack = this.getNeighbourCellsAttack(this.indexSelectedYellow, this.getDistanceAttack(this.characterType(this.indexSelectedYellow)));

            if (neighbourCellsAttack.includes(index)) {
              this.gamePlay.selectCell(index, 'red');
              this.gamePlay.setCursor(cursors.crosshair);
            } else {
              this.gamePlay.setCursor(cursors.notallowed);
            }
          }
        }
      } else {
        if (this.indexSelectedYellow !== -1) {
          let neighbourCells = this.getNeighbourCells(this.indexSelectedYellow, this.getDistanceMove(this.characterType(this.indexSelectedYellow)));

          if (this.indexSelectedGreen !== -1) {
            this.gamePlay.deselectCell(this.indexSelectedGreen);
          } else if (this.indexSelectedRed !== -1) {
            this.gamePlay.deselectCell(this.indexSelectedRed);
          }

          if (neighbourCells.includes(index)) {
            this.gamePlay.selectCell(index, 'green');
            this.gamePlay.setCursor(cursors.pointer);
          } else {
            this.gamePlay.setCursor(cursors.notallowed);
          }
          
        } else {
          this.gamePlay.setCursor(cursors.notallowed);
        }
      }
    }
    // TODO: react to mouse enter
  }

  static characterInfo(character) {  // static чтоб использовать в тестах
    return `\u{1F396}${character.level} \u{2694}${character.attack} \u{1F6E1}${character.defence} \u{2764}${character.health}`;
  }

  onCellLeave(index) {
    // this.gamePlay.hideCellTooltip(index); // ??? вроде и без этого скрывает подсказку
    // TODO: react to mouse leave
  }

  /**
   * метод для реализации хода противника
  */
  computerAction() {
    const self = this;  // ! чтоб использовать метод класса в функции, так как теряется this
    if (!this.nextStep) {
      // Получили индексы всех персонажей
      const listIndexUser = []
      const listIndexEnemy = []

      for (const iterator of this.positionedCharactersAll) {
        for (const userCharacter of this.userTeam.characters) {
          if (userCharacter.constructor.name === iterator.character.constructor.name && !listIndexUser.includes(iterator.position)) {
            listIndexUser.push(iterator.position)
          }
        }

        for (const enemyCharacter of this.enemyTeam.characters) {
          if (enemyCharacter.constructor.name === iterator.character.constructor.name && !listIndexEnemy.includes(iterator.position)) {
            listIndexEnemy.push(iterator.position)
          }
        }
      }

      // определяем атакуем или движемся
      let isAttackExecuted = false;
      let minDistance = Infinity;
      let min;
      let pair;

      // атакуем или высчитываем ближайших противников
      outerLoop: for (const enemy of listIndexEnemy) {
        const NeighbourCellsAttack = this.getNeighbourCellsAttack(enemy, this.getDistanceAttack(this.characterType(enemy)))

        for (const user of listIndexUser) {
          if (NeighbourCellsAttack.includes(user)) {
            const attacking = this.positionedCharactersAll.find((character) => character.position === enemy);
            const target = this.positionedCharactersAll.find((character) => character.position === user);
            const damage = Math.max(attacking.character.attack - target.character.defence, attacking.character.attack * 0.1);

            target.character.health = target.character.health - damage;

            this.gamePlay.showDamage(user, damage)
              .then(() => {
                this.removeCharacter(target, user);
                this.gamePlay.redrawPositions(this.positionedCharactersAll);
              });
            isAttackExecuted = true;
            break outerLoop;

          } else {
            min = calculateDistance(enemy, user);
            if (min < minDistance) {
              minDistance = min;
              pair = [enemy, user]
            }
          }
        }
      }

      // если не было атаки, то определяем куда двигаться
      if (!isAttackExecuted && pair) {
        const path = aStarSearch(pair[0], pair[1]);  // получаем путь
        const enemy = this.positionedCharactersAll.find((char) => char.position === pair[0]);
        let flag = false;

        // если можно подобраться на дистанцию атаки
        for (const iterator of path.slice(1, -1)) {
          const distanceAtatack = this.getDistanceAttack(self.characterType(pair[0]));
          const arrNeighbourCellsAttack = this.getNeighbourCellsAttack(iterator, distanceAtatack);

          if (arrNeighbourCellsAttack.includes(pair[1]) && this.gamePlay.cells[iterator].children.length === 0) {
            flag = true;
            enemy.position = iterator;
            break;
          }
        }

        // если нет, то просто двигаемся максимально близко к цели
        if (!flag) {
          const distanceMove = this.getDistanceMove(self.characterType(pair[0]));
          const arrNeighbourCells = this.getNeighbourCells(pair[0], distanceMove);

          for (const iterator of path.slice(1, -1)) {
            if (arrNeighbourCells.includes(iterator) && this.gamePlay.cells[iterator].children.length === 0) {
              enemy.position = iterator;
              break;
            }
          }
        }
        this.nextStep = true;
        this.gamePlay.redrawPositions(this.positionedCharactersAll);

      }
    }

    /** 
     * Это функция, которая рассчитывает расстояние между двумя клетками 
     * на игровом поле. Она использует формулу Евклидового расстояния для
     * определения длины прямой линии между двумя точками.
    */
    function calculateDistance(start, end) {
      const startX = start % 8;  // получаем координаты x для start
      const startY = Math.floor(start / 8); // получаем координаты y для start
  
      const endX = end % 8; // получаем координаты x для end
      const endY = Math.floor(end / 8); // получаем координаты y для end
  
      // вычисление расстояния между начальной и конечной клетками, используя Евклидово расстояние
      const distance = Math.sqrt((startX - endX) ** 2 + (startY - endY) ** 2);
  
      return distance;
    }

    /**
     * Это функция, которая выполняет поиск по алгоритму A*. 
     * Она инициализирует открытый и закрытый списки, 
     * создает начальный и конечный узлы, 
     * добавляет начальный узел в открытый список. 
     * Затем она входит в цикл, пока открытый список не пуст.
    */
    function aStarSearch(start, end) {
      const openList = []; // список для открытых узлов
      const closedList = []; // список для закрытых узлов
      
      const startNode = new Node(start);  // создание узла для начальной клетки
      const endNode = new Node(end);  // создание узла для конечной клетки
      
      openList.push(startNode);  // добавление начального узла в открытый список
      
      while (openList.length > 0) {
        // Выбираем узел с самой низкой общей оценкой
        openList.sort((a, b) => a.f - b.f);
        const currentNode = openList.shift(); // удаление и возвращение первого элемента массива openList
        
        closedList.push(currentNode);  // добавление текущего узла в закрытый список
        
        // если достигнута конечная клетка, построение и возврат найденного пути
        if (currentNode.index === endNode.index) {
            let path = [];
            let temp = currentNode;
            while (temp !== null) {
                path.push(temp.index);
                temp = temp.parent;
            }
            
            path.reverse(); //  требуется для пути от противника к пользователю
            return path;
        }
        
        const neighbors = self.getNeighbourCells(currentNode.index, 1)  // получение соседних клеток для текущего узла
        
        for (let i = 0; i < neighbors.length; i++) {
            const neighbor = neighbors[i];
            
            // Проверяем, содержится ли сосед в закрытом списке
            if (closedList.find(n => n.index === neighbor)) {
                continue;
            }
            
            const gScore = currentNode.g + 1; // вычисление стоимости пути от начальной клетки до соседа
            
            // проверка, содержится ли сосед в открытом списке или имеется более лучший путь до соседа
            const existingNode = openList.find(n => n.index === neighbor);
            if (existingNode && gScore >= existingNode.g) {
                continue;
            }
            
            const hScore = calculateDistance(neighbor, endNode.index);  // вычисление оценки расстояния от соседа до конечной клетки
            const newNode = new Node(neighbor, currentNode, gScore, hScore);  // создание нового узла для соседа
            
            if (existingNode) {
                const index = openList.indexOf(existingNode);
                openList.splice(index, 1);  // удаление существующего узла из открытого списка
            }
            
            openList.push(newNode);  // добавление нового узла в открытый список
        }
      }
      
      // если путь не найден, возвращаем null
      return null;
    }
  }

  characterType(index) {
    return this.positionedCharactersAll.find((item) => item.position === index).character.constructor.name;
  }
  
  /**
   * Метод определения начальной позиции персонажей:
   * - positions сортируется случайным образом в arrayPositions
   * - positionedCharactersTemp: берутся первые две позиции из arrayPositions 
   * @param {obj} positions - массив возможных позиций
   * @param {obj} team  - команда персонажей
   * @returns {obj} - содержащий {character: Vampire, position: 47} 
   */
  positionedCharacters(positions, team) {
    const arrayPositions = [...positions].sort(() => Math.random() - 0.5);

    const positionedCharactersTemp = team.characters.map((character, index) => {
      const position = arrayPositions[index];

      return new PositionedCharacter(character, position);
    });
  
    return positionedCharactersTemp;
  }
  
  /**
   * Метод для удаления погибших персонажей
   * @param {obj} target - атакуемый персонаж в формате positionedCharacters
   * @param {number} index - его положение(индекс)
   */
  removeCharacter(target, index) {
    if (target.character.health <= 0) {
      this.positionedCharactersAll.forEach((el, ind) => {
        if (el.position === index) {
          this.positionedCharactersAll.splice(ind, 1);
          this.gamePlay.cells[index].title = '';
          if (this.indexSelectedYellow === index) {
            this.gamePlay.deselectCell(this.indexSelectedYellow);
          }
        }
      })      

      this.checkTeam();
    }
  }

  arrayPosition() {
    const arrayPosition = [];
    let arrayTemp = [];
    for (let i = 0; i < this.gamePlay.boardSize ** 2; i++) {
      arrayTemp.push(i);
      if (arrayTemp.length === this.gamePlay.boardSize) {
        arrayPosition.push(arrayTemp);
        arrayTemp = [];
      }
    }

    const userPositions = arrayPosition.map((item) => item.slice(0, 2)).flat();
    const enemyPositions = arrayPosition.map((item) => item.slice(-2)).flat();

    return [userPositions, enemyPositions];
  }
  
  getNeighbourCells(index, distance) {
    const row = Math.floor(index / this.gamePlay.boardSize);
    const col = index % this.gamePlay.boardSize;
  
    const neighbours = [];      
    
    for (let i = 1; i <= distance; i++) {
      // Клетки вправо
      if (col + i < this.gamePlay.boardSize) {  
        neighbours.push(index + i);
      }
      
      // Клетки влево
      if (col - i >= 0) {
        neighbours.push(index - i);
      }

      // Клетки вверх
      if (row - i >= 0) {
        neighbours.push(index - this.gamePlay.boardSize * i);
      }

      // Клетки вниз
      if (row + i < this.gamePlay.boardSize) {
        neighbours.push(index + this.gamePlay.boardSize * i);
      }

      // Диагональ вправо-вверх
      if (col + i < this.gamePlay.boardSize && row - i >= 0) {
        neighbours.push(index - this.gamePlay.boardSize * i + i);
      }

      // Диагональ вправо-вниз
      if (col + i < this.gamePlay.boardSize && row + i < this.gamePlay.boardSize) {
        neighbours.push(index + this.gamePlay.boardSize * i + i);
      }

      // Диагональ влево-вверх
      if (col - i >= 0 && row - i >= 0) {
        neighbours.push(index - this.gamePlay.boardSize * i - i);
      }

      // Диагональ влево-вниз
      if (col - i >= 0 && row + i < this.gamePlay.boardSize) {
        neighbours.push(index + this.gamePlay.boardSize * i - i);
      }
    }

    return neighbours;
  }

  getNeighbourCellsAttack(index, distance) {
    const row = Math.floor(index / 8);
  
    const neighbours = [];     
    const temp = [index];
    
    for (let i = 1; i <= distance; i++) {
      // Клетки вверх
      if (row - i >= 0) {
        neighbours.push(index - 8 * i);
        temp.push(index - 8 * i);
      }

      // Клетки вниз
      if (row + i < 8) {
        neighbours.push(index + 8 * i);
        temp.push(index + 8 * i);
      }
    }

    temp.forEach((el) => {
      const col = el % 8;

      for (let i = 1; i <= distance; i++) {
        // Клетки вправо
        if (col + i < 8) {
          neighbours.push(el + i);
        }
        
        // Клетки влево
        if (col - i >= 0) {
          neighbours.push(el - i);
        }
      }
    })

    return neighbours;
  }

  getDistanceMove(characterType) {
    const distanceMove = [
      ['Bowman', 2],
      ['Swordsman', 4],
      ['Magician', 1],
      ['Vampire', 2],
      ['Undead', 4],
      ['Daemon', 1],
    ];
  
    for (const [type, step] of distanceMove) {
      if (type === characterType) {
        return step;
      }
    }
  }

  getDistanceAttack(characterType) {
    const distanceAttack = [
      ['Bowman', 2],
      ['Swordsman', 1],
      ['Magician', 4],
      ['Vampire', 2],
      ['Undead', 1],
      ['Daemon', 4],
    ];
  
    for (const [type, step] of distanceAttack) {
      if (type === characterType) {
        return step;
      }
    }
  }

  clearCellListeners() {
    this.gamePlay.cellClickListeners = [];
    this.gamePlay.cellEnterListeners = [];
  }
}
