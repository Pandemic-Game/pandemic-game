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
        { value: 1e18, symbol: 'Qui' }
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

export const months = [
    { name: 'Jan', numDays: 31 },
    { name: 'Feb', numDays: 28 },
    { name: 'Mar', numDays: 31 },
    { name: 'Apr', numDays: 30 },
    { name: 'May', numDays: 31 },
    { name: 'Jun', numDays: 30 },
    { name: 'Jul', numDays: 31 },
    { name: 'Aug', numDays: 31 },
    { name: 'Sep', numDays: 30 },
    { name: 'Oct', numDays: 31 },
    { name: 'Nov', numDays: 30 },
    { name: 'Dec', numDays: 31 }
];
