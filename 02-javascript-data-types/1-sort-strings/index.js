/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  //для корректной сортировки Uppercase
  const sortOptions = {
    caseFirst: 'upper',
  };
  //для корректной сортировки смешанных локалей
  const locales = ['ru', 'en'];

  //возвращаем копию отсортированного массива
  return [...arr].sort(function (a, b) {
    if (param === 'asc') {
      return a.localeCompare(b, locales, sortOptions);
    } else {
      return b.localeCompare(a, locales, sortOptions);
    }
  });
}
