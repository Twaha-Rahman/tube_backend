function matchChecker(str, keywords) {
  const excludedWords = ['playlist', 'episodes', "let's"];
  const regexToMatchAllEmojis = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;
  const regexToMatchAllSpecialCharacters = /\W|_/g;
  const refinedStr = str.replace(regexToMatchAllSpecialCharacters, ' ').replace(regexToMatchAllEmojis, ' ');
  const words = refinedStr.toLowerCase().split(' ');

  let returnVal = false;

  keywords.forEach((keyword) => {
    words.forEach((word, index, wordsArr) => {
      if (word === keyword) {
        const nextWord = wordsArr[index + 1];
        if (!excludedWords.includes(nextWord)) {
          returnVal = true;
        }
      }
    });
  });
  return returnVal;
}

module.exports = matchChecker;
