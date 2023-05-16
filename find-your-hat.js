const prompt = require('prompt-sync')();

const hat = '^';
const hole = 'O';
const fieldCharacter = '░';
const pathCharacter = '*';

class Field {
  constructor(field) {
    this.field = field;
    this.yLoc = findElemLoc(this.field,pathCharacter)[0][0];
    this.xLoc = findElemLoc(this.field,pathCharacter)[0][1];
    this.hatYLoc = findElemLoc(this.field,hat)[0][0]
    this.hatXLoc = findElemLoc(this.field,hat)[0][1]
  }

  print() {
    let stringsArray = [], i =0;
    while(i < this.field.length) {
      stringsArray.push(this.field[i].join(''))
      i++;
    }
    return stringsArray.join('\n')
  }
}

function randomize (numberLimit) {
  return Math.floor(Math.random()*numberLimit)
}


//function to generate randomized new fields. Width stands for the number of elements in each array inside of newField array. Length stands for number of arrays inside newField array. Number of hats and game level determines how difficult it will be to complete the game.
const generateNewField = (width, length, numberOfHoles) => {
  let newField = [];
  //for loop that pushs into newField array the number of arrays corresponding to field length containing a number of elements that equals to width
  for(i = 0; i < length; i++) {
    newField.push(Array(width).fill(fieldCharacter));
  }
  
  newField[randomize(length)][randomize(width)] = pathCharacter;

  let hatXLoc = randomize(width)
  let hatYLoc = randomize(length)

  // hat position should be different than pathCaracter in this initial version of the game
  while (newField[hatYLoc][hatXLoc] === pathCharacter) {
    hatXLoc = randomize(width)
    hatYLoc = randomize(length)
  }

  // allocating hat character in hat position
  newField[hatYLoc][hatXLoc] = hat;

  // allocating holes corresponding to numberOfHoles and making sure they don't occupy spaces from other characters other than field characters
  for(let i = 0; i < numberOfHoles; i++) {
    if(numberOfHoles > (width*length) - 2) {numberOfHoles = (width*length) - 2}
    let holeXLoc = randomize(width)
    let holeYLoc = randomize(length)
    while ((newField[holeYLoc][holeXLoc] === pathCharacter) || (newField[holeYLoc][holeXLoc] === hat) || (newField[holeYLoc][holeXLoc] === hole)) {
      holeXLoc = randomize(width)
      holeYLoc = randomize(length)
    }
    newField[holeYLoc][holeXLoc] = hole;
} 
  return findAPath(newField);
}

function distanceFromHat(loc, hatLoc) {
  return Math.abs(hatLoc[0] - loc[0]) + Math.abs(hatLoc[1] - loc[1])
}

function checkAround(field, x, y) {
  return {
    up: {element: field[y - 1] === undefined ? 'empty' : field[y - 1][x], 'location': [y - 1, x]},
    down: {element: field[y + 1] === undefined ? 'empty' : field[y + 1][x], 'location': [y + 1, x]},
    left: {element: field[y][x - 1] === undefined ? 'empty' : field[y][x - 1], 'location': [y, x - 1]},
    right: {element: field[y][x + 1] === undefined ? 'empty' : field[y][x + 1], 'location': [y, x + 1]}
  } 
}

function findAPath(field) {
  let hatLoc = findElemLoc(field,hat)
  let arr = findElemLoc(field,pathCharacter)
  let x = findElemLoc(field,pathCharacter)[0][1]; let y = findElemLoc(field,pathCharacter)[0][0]
  let box = null;
  let storeField = [];
  let pathArr = [[y,x]];
  let distsFromHat = null;
  let numberOfHoles = findElemLoc(field,hole).length;

while (JSON.stringify([y, x]) !== JSON.stringify(hatLoc[0])) {
  box = checkAround(field,x,y);
  storeField = [box.up,box.down,box.left,box.right].filter(e => e.element === fieldCharacter);
  if(distanceFromHat([y, x],hatLoc[0]) === 1){
    x = hatLoc[0][1];
    y = hatLoc[0][0];
    pathArr.push([y, x]);
  } else if(JSON.stringify(storeField) !== JSON.stringify([])) {
    distsFromHat = storeField.map(e => distanceFromHat(e.location,hatLoc[0]));
    x = storeField[distsFromHat.indexOf(Math.min(...distsFromHat))].location[1];
    y = storeField[distsFromHat.indexOf(Math.min(...distsFromHat))].location[0];
    field[y][x] = pathCharacter;
    pathArr.push([y, x])
  } else if (JSON.stringify(storeField) === JSON.stringify([])) {
    field = generateNewField(field[0].length,field.length,numberOfHoles);
    hatLoc = findElemLoc(field,hat);
    x = findElemLoc(field,pathCharacter)[0][1];
    y = findElemLoc(field,pathCharacter)[0][0];
    pathArr = [[y,x]];
  }
}
pathArr.slice(1,pathArr.length - 1).forEach(e => field[e[0]][e[1]] = fieldCharacter)
return field
}

const field1 = new Field(generateNewField(10,10,40))

function findElemLoc (field,elem) {
  let indexsArray = [];
  for(y = 0; y < field.length; y++) {
    if (field[y].includes(elem)) {
      elemYLoc = y;
      elemXLoc = field[elemYLoc].indexOf(elem);
      while(elemXLoc !== -1) {
        indexsArray.push([elemYLoc,elemXLoc]);
        elemXLoc = field[elemYLoc].indexOf(elem, elemXLoc + 1);
      }
    }
  }
  return indexsArray;
}

function findTheHat() {
  console.log(field1.print());
  let input = prompt('Which way?')
  switch(input) {
    case 'd': 
      if(field1.yLoc + 1 > field1.field.length - 1) {console.log("You can't go down. Please choose another direction")} else {
      field1.field[field1.yLoc + 1][field1.xLoc] === hole ? console.log('It looks like u fell in the hole. Better luck next time!') : field1.field[field1.yLoc + 1][field1.xLoc] = pathCharacter;
      field1.yLoc++;}
      break;
    case 'r':
      if(field1.xLoc + 1 > field1.field[0].length - 1) {console.log("You can't go right. Please choose another direction")} else {
      field1.field[field1.yLoc][field1.xLoc + 1] === hole ? console.log('It looks like u fell in the hole. Better luck next time!') : field1.field[field1.yLoc][field1.xLoc + 1] = pathCharacter;
      field1.xLoc++;}
      break;
    case 'u': 
      if(field1.yLoc - 1 < 0) {console.log("You can't go up. Please choose another direction")} else {
      field1.field[field1.yLoc - 1][field1.xLoc] === hole ? console.log('It looks like u fell in the hole. Better luck next time!') : field1.field[field1.yLoc - 1][field1.xLoc] = pathCharacter;
      field1.yLoc--;}
      break;
    case 'l':
      if(field1.xLoc - 1 < 0) {console.log("You can't go left. Please choose another direction")} else {
      field1.field[field1.yLoc][field1.xLoc - 1] === hole ? console.log('It looks like u fell in the hole. Better luck next time!') : field1.field[field1.yLoc][field1.xLoc - 1] = pathCharacter;
      field1.xLoc--;}
      break;
    default: 
      console.log('Please type d, r, u or l')
  }
  
  if(field1.field[field1.yLoc][field1.xLoc] === hole) {
    field1.field[field1.yLoc][field1.xLoc] = 'X'; console.log('Game over')
  }
  else if(field1.field[field1.yLoc][field1.xLoc] != field1.field[field1.hatYLoc][field1.hatXLoc]) {
    findTheHat();
  } else {
    console.log('Congratulations! You found the hat!')
  }
}

findTheHat()





