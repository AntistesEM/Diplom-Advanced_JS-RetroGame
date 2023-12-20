import themes from "./themes";
import PositionedCharacter from './PositionedCharacter';
import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Magician from './characters/Magician';
import Vampire from './characters/Vampire';
import Undead from './characters/Undead';
import Daemon from './characters/Daemon';
import { generateTeam } from './generators';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.maxLevel = 4;
    this.userTypes = [Bowman, Swordsman, Magician];
    this.enemyTypes = [Vampire, Undead, Daemon];
    [this.userPositions, this.enemyPositions] = this.arrayPosition();
  }

  init() {
    // console.log(this.gamePlay);
    // console.log(this.stateService);

    const countTeam = Math.floor(Math.random() * 5) + 1; // случайное количество героев от 1 до 6
    const userTeam = generateTeam(this.userTypes, this.maxLevel, countTeam); // команда игрока
    const enemyTeam = generateTeam(this.enemyTypes, this.maxLevel, countTeam); // команда противника    
    const positionedCharactersUser = this.positionedCharacters(this.userPositions, userTeam, countTeam); // массив объектов PositionedCharacter для игрока
    const positionedCharactersEnemy = this.positionedCharacters(this.enemyPositions, enemyTeam, countTeam); // массив объектов PositionedCharacter для противника
    const positionedCharacters = positionedCharactersUser.concat(positionedCharactersEnemy); // объединение массивов объектов PositionedCharacter

    this.gamePlay.drawUi(themes.prairie); // отрисовка поля
    this.gamePlay.redrawPositions(positionedCharacters); // отрисовка героев на поле

    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
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

  onCellClick(index) {
    // TODO: react to click
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
  }
}
