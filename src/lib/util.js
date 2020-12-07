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
    { name: 'Jan', longName: 'January', numDays: 31 },
    { name: 'Feb', longName: 'February', numDays: 28 },
    { name: 'Mar', longName: 'March', numDays: 31 },
    { name: 'Apr', longName: 'April', numDays: 30 },
    { name: 'May', longName: 'May', numDays: 31 },
    { name: 'Jun', longName: 'June', numDays: 30 },
    { name: 'Jul', longName: 'July', numDays: 31 },
    { name: 'Aug', longName: 'August', numDays: 31 },
    { name: 'Sep', longName: 'September', numDays: 30 },
    { name: 'Oct', longName: 'October', numDays: 31 },
    { name: 'Nov', longName: 'November', numDays: 30 },
    { name: 'Dec', longName: 'December', numDays: 31 }
];
