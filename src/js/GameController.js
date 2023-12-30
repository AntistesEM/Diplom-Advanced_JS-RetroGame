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

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.maxLevel = 4;
    this.userTypes = [Bowman, Swordsman, Magician];
    this.enemyTypes = [Vampire, Undead, Daemon];
    [this.userPositions, this.enemyPositions] = this.arrayPosition();
    this.positionedCharactersAll = [];
    this.indexSelectedGreen = -1;
    this.indexSelectedYellow = -1;
    this.indexSelectedRed = -1;
  }

  init() {
    const countTeam = Math.floor(Math.random() * 5) + 1; // случайное количество героев от 1 до 6
    const userTeam = generateTeam(this.userTypes, this.maxLevel, countTeam); // команда игрока
    const enemyTeam = generateTeam(this.enemyTypes, this.maxLevel, countTeam); // команда противника    
    const positionedCharactersUser = this.positionedCharacters(this.userPositions, userTeam, countTeam); // массив объектов PositionedCharacter для игрока
    const positionedCharactersEnemy = this.positionedCharacters(this.enemyPositions, enemyTeam, countTeam); // массив объектов PositionedCharacter для противника
    
    this.positionedCharactersAll = positionedCharactersUser.concat(positionedCharactersEnemy); // объединение массивов объектов PositionedCharacter

    this.gamePlay.drawUi(themes.prairie); // отрисовка поля
    this.gamePlay.redrawPositions(this.positionedCharactersAll); // отрисовка героев на поле

    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));

    // console.log(this.gamePlay);
    // console.log('11', this.gamePlay.cells[0]);
    // console.log('this.positionedCharactersAll===', this.positionedCharactersAll);
    // console.log(this.gamePlay.cells[1].children);

    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
  }

  onCellClick(index) {
    // TODO: react to click    
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
          const damage = Math.max(foundCharacter.character.attack - target.character.defence, foundCharacter.character.attack * 0.1);

          target.character.health = target.character.health - damage;

          this.gamePlay.showDamage(index, damage)
            .then(() => {
              this.gamePlay.redrawPositions(this.positionedCharactersAll);
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
    }
  }

  onCellEnter(index) {
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
        // console.log('user');
        this.gamePlay.setCursor(cursors.pointer);
      } else if (this.enemyTypes.find((item) => item.name === this.characterType(index))) {
        // console.log('enemy');
        if (this.indexSelectedYellow !== -1) {
          const neighbourCellsAttack = this.getNeighbourCellsAttack(this.indexSelectedYellow, this.getDistanceAttack(this.characterType(this.indexSelectedYellow)));
          // console.log('indexSelectedYellow===', indexSelectedYellow);
          // console.log('this.getDistanceMove(this.characterType(indexSelectedYellow))===', this.getDistanceMove(this.characterType(indexSelectedYellow)));
          // console.log('neighbourCellsAttack===', neighbourCellsAttack);
          // console.log('index===', index);
          if (neighbourCellsAttack.includes(index)) {
            // console.log('курсор');
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
    // TODO: react to mouse enter
  }

  static characterInfo(character) {  // static чтоб использовать в тестах
    return `\u{1F396}${character.level} \u{2694}${character.attack} \u{1F6E1}${character.defence} \u{2764}${character.health}`;
  }

  onCellLeave(index) {
    // this.gamePlay.hideCellTooltip(index); // ??? вроде и без этого скрывает подсказку
    // TODO: react to mouse leave
  }

  characterType(index) {
    return this.positionedCharactersAll.find((item) => item.position === index).character.constructor.name;
  }
  
  positionedCharacters(positions, team, countTeam) {
    let arrayPositions = [];
  
    while (arrayPositions.length !== countTeam) {      
      const index = Math.floor(Math.random() * positions.length);
      const position = positions[index];
  
      if (!arrayPositions.includes(position)) {
        arrayPositions.push(positions[index]);  
      }
    }
  
    const positionedCharacters = team.characters.map((character, index) => {
      const position = arrayPositions[index];
      return new PositionedCharacter(character, position);
    });
  
    return positionedCharacters;
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

    const userPositions = arrayPosition.map((item) => item.slice(0, 4)).flat();  // todo не забыть исправить с 4 на 2
    const enemyPositions = arrayPosition.map((item) => item.slice(-4)).flat();  // todo не забыть исправить с 4 на 2

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
}
