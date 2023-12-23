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

    console.log(this.gamePlay);
    console.log('11', this.gamePlay.cells[0]);
    // console.log('this.positionedCharactersAll===', this.positionedCharactersAll);
    console.log(this.gamePlay.cells[1].children);

    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
  }

  onCellClick(index) {
    // TODO: react to click
    if (this.gamePlay.cells[index].children.length !== 0) {
      if (this.userTypes.find((item) => item.name === this.characterType(index))) {
        let indexSelected = this.gamePlay.cells.findIndex((item) => item.classList.contains('selected-yellow'));
        
        if (indexSelected !== -1) {
          this.gamePlay.deselectCell(indexSelected);
        }

        this.gamePlay.selectCell(index);
      } else {
        GamePlay.showError('Это не ваш персонаж!');
      }
    }
  }

  onCellEnter(index) {
    if (this.gamePlay.cells[index].children.length !== 0) {      
      const character = this.positionedCharactersAll.find((item) => item.position === index);
      const tooltip = GameController.characterInfo(character.character);

      this.gamePlay.showCellTooltip(tooltip, index);  

      if (this.userTypes.find((item) => item.name === this.characterType(index))) {
        this.gamePlay.setCursor(cursors.pointer);
      } else if (this.enemyTypes.find((item) => item.name === this.characterType(index))) {
        this.gamePlay.setCursor(cursors.crosshair);
      }      
    } else {
      this.gamePlay.setCursor(cursors.notallowed);
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

    const userPositions = arrayPosition.map((item) => item.slice(0, 2)).flat();
    const enemyPositions = arrayPosition.map((item) => item.slice(-2)).flat();

    return [userPositions, enemyPositions];
  }
}
