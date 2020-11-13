/* eslint-disable no-plusplus */

export function sum(array) {
  return array.reduce(function (a, b) {
    return a + b;
  }, 0);
}

export function nFormatter(num, digits) {
  const si = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'K' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'B' },
    { value: 1e12, symbol: 'T' },
    { value: 1e15, symbol: 'Qua' },
    { value: 1e18, symbol: 'Qui' },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  let i;
  for (i = si.length - 1; i > 0; i--) {
    if (num >= si[i].value) {
      break;
    }
  }
  return `${(num / si[i].value).toFixed(digits).replace(rx, '$1')} ${si[i].symbol}`;
}
