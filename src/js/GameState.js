export default class GameState {
  // static currentPlayer = 'user';

  static from(object) {
    // TODO: create object
    if (typeof object === 'object') {
      return object;
    }
    return null;
  }
  
}
