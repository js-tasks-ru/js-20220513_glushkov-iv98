/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  let finalString = [];
  let currentPos = 0;
  const stringSize = string.length;

  if (size === undefined) {
    return string;
  }
  while (currentPos < stringSize) {
    currentPos += pushSolidSequence(string[currentPos]);
  }

  function pushSolidSequence(symbol) {
    let sequenceLength = 0;

    while (string[currentPos] === symbol) {
      if (sequenceLength < size) {
        finalString.push(string[currentPos]);
      }
      sequenceLength++;
      currentPos++;
    }

    //если длинна неповторяющейся цепочки символов === 1, то сдвигаем каретку на 1. Иначе сдвигаем на sequenceLength
    return sequenceLength === 0 ? 1 : sequenceLength;
  }

  return finalString.join('');
}
