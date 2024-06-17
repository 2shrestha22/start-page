(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const BikramSambat = require('@askbuddie/bikram-sambat')

function setNepaliDate() {
    const today = new BikramSambat.default();
    const dateElement = document.getElementById('date');
    // Set the formatted date as text content
    dateElement.textContent = today.format('MMMM DD, YYYY')
}

window.onload = setNepaliDate; // Run the function on window load


},{"@askbuddie/bikram-sambat":11}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BikramSambat = void 0;
const format_1 = require("./format");
const parser_1 = require("./parser");
const getDaysFromBsNewYear_1 = require("./utils/getDaysFromBsNewYear");
const addDaysToGregorianDate_1 = require("./utils/addDaysToGregorianDate");
const data_1 = require("./data");
const getDaysBetweenTwoAdDates_1 = require("./utils/getDaysBetweenTwoAdDates");
const getNewYearDateInfo_1 = require("./utils/getNewYearDateInfo");
class BikramSambat {
    constructor(dateStr) {
        if (typeof dateStr === 'string') {
            const parsedDate = (0, parser_1.parse)(dateStr);
            if (typeof parsedDate === 'string') {
                this.year = undefined;
                this.month = undefined;
                this.day = undefined;
            }
            else {
                const { year, month, day } = parsedDate;
                this.year = year;
                this.month = month ?? 1;
                this.day = day ?? 1;
            }
        }
        else if (dateStr instanceof BikramSambat) {
            this.year = dateStr.getYear();
            this.month = dateStr.getMonth();
            this.day = dateStr.getDay();
        }
        else {
            const currentDate = new Date().toISOString().slice(0, 10);
            const currentBsDate = BikramSambat.fromAD(currentDate);
            this.year = currentBsDate.getYear();
            this.month = currentBsDate.getMonth();
            this.day = currentBsDate.getDay();
        }
    }
    setYear(year) {
        this.year = year;
    }
    setMonth(month) {
        this.month = month;
    }
    setDay(day) {
        this.day = day;
    }
    getYear() {
        return this.year ?? NaN;
    }
    getMonth() {
        return this.month ?? NaN;
    }
    getDay() {
        return this.day ?? NaN;
    }
    format(formatStr) {
        return (0, format_1.format)(this, formatStr);
    }
    toString() {
        if (this.year === undefined ||
            this.month === undefined ||
            this.day === undefined) {
            return data_1.InvalidDate;
        }
        if (!(0, parser_1.isDayValid)(this.year, this.month, this.day)) {
            return data_1.InvalidDate;
        }
        const month = `${this.month}`.padStart(2, '0');
        const day = `${this.day}`.padStart(2, '0');
        return `${this.year}-${month}-${day}`;
    }
    getPreviousYear() {
        return this.year ? this.year - 1 : NaN;
    }
    getNextYear() {
        return this.year ? this.year + 1 : NaN;
    }
    toAD() {
        if (!this.year || !this.month || !this.day) {
            return new Date(data_1.InvalidDate);
        }
        const daysFromNewYear = (0, getDaysFromBsNewYear_1.getDaysFromBsNewYear)(this.year, this.month, this.day);
        const newYearDayAD = BikramSambat.newYearMap[this.year];
        const gregorianDate = (0, addDaysToGregorianDate_1.addDaysToGregorianDate)(new Date(newYearDayAD), daysFromNewYear - 1);
        return gregorianDate;
    }
    static toAD(date) {
        const bsDate = new BikramSambat(date);
        return bsDate.toAD();
    }
    static fromAD(date) {
        if (!date) {
            return new BikramSambat();
        }
        const gregorianDate = new Date(date);
        if (gregorianDate.toString() === data_1.InvalidDate) {
            return new BikramSambat(data_1.InvalidDate);
        }
        const { newYearDate, bsYear } = (0, getNewYearDateInfo_1.getNewYearDateInfo)(gregorianDate);
        const daysFromNewYear = (0, getDaysBetweenTwoAdDates_1.getDaysBetweenTwoAdDates)(gregorianDate, new Date(newYearDate));
        const bsDate = new BikramSambat(`${bsYear}-01-01`);
        bsDate.addDays(daysFromNewYear);
        return bsDate;
    }
    addYears(years) {
        if (this.year === undefined) {
            return this;
        }
        this.year += years;
        return this;
    }
    addMonths(months) {
        if (this.month === undefined || this.year === undefined) {
            return this;
        }
        const totalMonths = this.month + months;
        const adjustYear = (remainingMonths, yearsToAdd) => {
            const monthsInYear = BikramSambat.MONTHS_IN_A_YEAR;
            if (remainingMonths > monthsInYear) {
                return adjustYear(remainingMonths - monthsInYear, yearsToAdd + 1);
            }
            else if (remainingMonths <= 0) {
                return adjustYear(remainingMonths + monthsInYear, yearsToAdd - 1);
            }
            else {
                this.month = remainingMonths;
                this.addYears(yearsToAdd);
                const daysInCurrentMonth = this.getDaysInMonth();
                if (this.day && this.day > daysInCurrentMonth) {
                    this.day = daysInCurrentMonth;
                }
                return this;
            }
        };
        return adjustYear(totalMonths, 0);
    }
    addDays(days) {
        if (this.day === undefined || this.month === undefined) {
            return this;
        }
        const totalDays = this.day + days;
        const adjustMonth = (remainingDays) => {
            const daysInMonth = this.getDaysInMonth();
            if (remainingDays > daysInMonth) {
                this.addMonths(1);
                return adjustMonth(remainingDays - daysInMonth);
            }
            else if (remainingDays <= 0) {
                this.addMonths(-1);
                return adjustMonth(daysInMonth + remainingDays);
            }
            else {
                this.day = remainingDays;
                return this;
            }
        };
        return adjustMonth(totalDays);
    }
    getDaysInMonth() {
        if (this.month === undefined || this.year === undefined) {
            return NaN;
        }
        return BikramSambat.daysInMonthMap[this.year][this.month - 1];
    }
    isLeapYear() {
        if (this.year === undefined) {
            return false;
        }
        const daysInCurrentYear = BikramSambat.daysInMonthMap[this.year].reduce((acc, days) => acc + days, 0);
        return daysInCurrentYear === BikramSambat.DAYS_IN_A_LEAP_YEAR;
    }
    getDayOfWeek() {
        if (this.year === undefined || this.month === undefined) {
            return NaN;
        }
        const dateInGregorian = this.toAD();
        const dayOfWeek = dateInGregorian.getDay();
        return dayOfWeek;
    }
    getPreviousMonth() {
        if (!this.month) {
            return null;
        }
        const month = this.month === 1 ? 12 : this.month - 1;
        return BikramSambat.nepaliMonths[month - 1];
    }
    getNextMonth() {
        if (!this.month) {
            return null;
        }
        const month = (this.month + 1) % 12;
        return BikramSambat.nepaliMonths[month - 1];
    }
    static getWeekdayNames(language) {
        return BikramSambat.nepaliDays.map((day) => day[language ?? 'np']);
    }
    static getMonthNames(language) {
        return data_1.NepaliMonthsData.map((month) => month[language ?? 'np']);
    }
    isSameYear(date) {
        if (this.toString() === data_1.InvalidDate || date.toString() === data_1.InvalidDate) {
            return false;
        }
        if (this.year === date.getYear()) {
            return true;
        }
        return false;
    }
    isSameMonth(date) {
        if (this.toString() === data_1.InvalidDate || date.toString() === data_1.InvalidDate) {
            return false;
        }
        if (this.year === date.getYear() && this.month === date.getMonth()) {
            return true;
        }
        return false;
    }
    isSameDay(date) {
        if (this.toString() === data_1.InvalidDate || date.toString() === data_1.InvalidDate) {
            return false;
        }
        if (this.year === date.getYear() &&
            this.month === date.getMonth() &&
            this.day === date.getDay()) {
            return true;
        }
        return false;
    }
    getWeekStartDate() {
        if (this.toString() === data_1.InvalidDate) {
            return this;
        }
        const currentDate = new BikramSambat(this);
        const dayOfWeek = currentDate.getDayOfWeek();
        const startOfWeek = currentDate.addDays(-dayOfWeek);
        return startOfWeek;
    }
    getWeekEndDate() {
        if (this.toString() === data_1.InvalidDate) {
            return this;
        }
        const currentDate = new BikramSambat(this);
        const dayOfWeek = currentDate.getDayOfWeek();
        const endOfWeek = currentDate.addDays(6 - dayOfWeek);
        return endOfWeek;
    }
    isSameWeek(date) {
        if (this.toString() === data_1.InvalidDate || date.toString() === data_1.InvalidDate) {
            return false;
        }
        const weekStartDate = this.getWeekStartDate();
        const weekEndDate = this.getWeekEndDate();
        if (weekStartDate.isAfter(date) && weekEndDate.isBefore(date)) {
            return true;
        }
        return false;
    }
    isAfter(date) {
        if (this.year === undefined ||
            this.month === undefined ||
            this.day === undefined ||
            date.toString() === data_1.InvalidDate) {
            return false;
        }
        if (this.year < date.getYear()) {
            return true;
        }
        else if (this.year > date.getYear()) {
            return false;
        }
        if (this.month < date.getMonth()) {
            return true;
        }
        else if (this.month > date.getMonth()) {
            return false;
        }
        if (this.day < date.getDay()) {
            return true;
        }
        else if (this.day > date.getDay()) {
            return false;
        }
        return false;
    }
    isBefore(date) {
        if (this.year === undefined ||
            this.month === undefined ||
            this.day === undefined ||
            date.toString() === data_1.InvalidDate ||
            this.isSameDay(date)) {
            return false;
        }
        return !this.isAfter(date);
    }
    getPreviousDay() {
        const currentDate = new BikramSambat(this);
        return currentDate.addDays(-1);
    }
    getNextDay() {
        const currentDate = new BikramSambat(this);
        return currentDate.addDays(1);
    }
    toJSON() {
        return this.toString();
    }
    startOfMonth() {
        if (this.year === undefined || this.month === undefined) {
            return this;
        }
        const firstDayOfMonth = new BikramSambat(this);
        firstDayOfMonth.setDay(1);
        return firstDayOfMonth;
    }
    endOfMonth() {
        if (this.year === undefined || this.month === undefined) {
            return this;
        }
        const daysInMonth = this.getDaysInMonth();
        const lastDayOfMonth = new BikramSambat(this);
        lastDayOfMonth.setDay(daysInMonth);
        return lastDayOfMonth;
    }
}
exports.BikramSambat = BikramSambat;
BikramSambat.nepaliDays = data_1.NepaliDaysData;
BikramSambat.newYearMap = data_1.NewYearMappingData;
BikramSambat.nepaliMonths = data_1.NepaliMonthsData;
BikramSambat.daysInMonthMap = data_1.DaysInMonthsMappingData;
BikramSambat.MONTHS_IN_A_YEAR = 12;
BikramSambat.DAYS_IN_A_LEAP_YEAR = 366;

},{"./data":5,"./format":10,"./parser":12,"./utils/addDaysToGregorianDate":13,"./utils/getDaysBetweenTwoAdDates":15,"./utils/getDaysFromBsNewYear":16,"./utils/getNewYearDateInfo":17}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateFormats = void 0;
exports.DateFormats = [
    { regex: /^(\d{4})$/, format: 'YYYY' },
    {
        regex: /^(\d{4})(?:[-/ ](\d{1,2}))$/,
        format: 'YYYY-MM'
    },
    {
        regex: /^(\d{2,4})(?:[-/ ](\d{1,2}))(?:[-/ ](\d{1,2}))$/,
        format: 'YYYY-MM-DD'
    },
    {
        regex: /^(\d{1,2})(?:[-/ ]([A-Za-z]+))(?:[-/ ](\d{4}))$/,
        format: 'DD-MMMM-YYYY'
    },
    {
        regex: /^(Baisakh|Jestha|Ashad|Shrawan|Bhadra|Ashoj|Kartik|Mangsir|Poush|Magh|Falgun|Chaitra)?(?:[-/ ,](\d{1,2}))(?:,)?(?:[-/ ,](\d{4}))?$/,
        format: 'MMMM-DD-YYYY'
    },
    {
        regex: /^(\d{1,2})(?:[-/ ](\d{1,2}))(?:[-/ ](\d{4}))$/,
        format: 'DD-MM-YYYY'
    }
];

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DaysInMonthsMappingData = void 0;
exports.DaysInMonthsMappingData = {
    '1975': [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    '1976': [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    '1977': [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    '1978': [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    '1979': [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    '1980': [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    '1981': [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
    '1982': [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    '1983': [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    '1984': [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    '1985': [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
    '1986': [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    '1987': [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    '1988': [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    '1989': [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
    '1990': [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    '1991': [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
    '1992': [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    '1993': [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    '1994': [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    '1995': [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
    '1996': [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    '1997': [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    '1998': [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    '1999': [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    '2000': [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    '2001': [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    '2002': [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    '2003': [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    '2004': [30, 32, 31, 32, 31, 30, 30, 30, 30, 29, 29, 31],
    '2005': [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    '2006': [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    '2007': [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    '2008': [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
    '2009': [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    '2010': [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    '2011': [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    '2012': [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
    '2013': [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    '2014': [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    '2015': [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    '2016': [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
    '2017': [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    '2018': [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    '2019': [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    '2020': [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    '2021': [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    '2022': [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
    '2023': [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    '2024': [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    '2025': [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    '2026': [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    '2027': [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    '2028': [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    '2029': [31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30],
    '2030': [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    '2031': [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    '2032': [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    '2033': [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    '2034': [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    '2035': [30, 32, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
    '2036': [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    '2037': [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    '2038': [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    '2039': [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
    '2040': [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    '2041': [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    '2042': [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    '2043': [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
    '2044': [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    '2045': [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    '2046': [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    '2047': [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    '2048': [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    '2049': [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
    '2050': [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    '2051': [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    '2052': [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    '2053': [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
    '2054': [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    '2055': [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    '2056': [31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30],
    '2057': [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    '2058': [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    '2059': [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    '2060': [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    '2061': [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    '2062': [31, 31, 31, 32, 31, 31, 29, 30, 29, 30, 29, 31],
    '2063': [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    '2064': [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    '2065': [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    '2066': [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
    '2067': [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    '2068': [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    '2069': [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    '2070': [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
    '2071': [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    '2072': [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    '2073': [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    '2074': [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    '2075': [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    '2076': [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
    '2077': [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    '2078': [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    '2079': [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    '2080': [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
    '2081': [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    '2082': [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
    '2083': [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
    '2084': [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
    '2085': [31, 32, 31, 32, 30, 31, 30, 30, 29, 30, 30, 30],
    '2086': [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
    '2087': [31, 31, 32, 31, 31, 31, 30, 29, 30, 30, 30, 30],
    '2088': [30, 31, 32, 32, 30, 31, 30, 30, 29, 30, 30, 30],
    '2089': [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
    '2090': [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
    '2091': [31, 31, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30],
    '2092': [30, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30],
    '2093': [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
    '2094': [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
    '2095': [31, 31, 32, 31, 31, 31, 30, 29, 30, 30, 30, 30],
    '2096': [30, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    '2097': [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
    '2098': [31, 31, 32, 31, 31, 31, 29, 30, 29, 30, 29, 31],
    '2099': [31, 31, 32, 31, 31, 31, 30, 29, 29, 30, 30, 30],
    '2100': [31, 32, 31, 32, 30, 31, 30, 29, 30, 29, 30, 30]
};

},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidDate = exports.DateFormats = exports.DaysInMonthsMappingData = exports.NewYearMappingData = exports.NepaliMonthsNameEn = exports.NepaliMonthsData = exports.NepaliDaysData = void 0;
var nepali_days_1 = require("./nepali-days");
Object.defineProperty(exports, "NepaliDaysData", { enumerable: true, get: function () { return nepali_days_1.NepaliDaysData; } });
var nepali_months_1 = require("./nepali-months");
Object.defineProperty(exports, "NepaliMonthsData", { enumerable: true, get: function () { return nepali_months_1.NepaliMonthsData; } });
Object.defineProperty(exports, "NepaliMonthsNameEn", { enumerable: true, get: function () { return nepali_months_1.NepaliMonthsNameEn; } });
var new_year_mapping_1 = require("./new-year-mapping");
Object.defineProperty(exports, "NewYearMappingData", { enumerable: true, get: function () { return new_year_mapping_1.NewYearMappingData; } });
var days_in_month_mapping_1 = require("./days-in-month-mapping");
Object.defineProperty(exports, "DaysInMonthsMappingData", { enumerable: true, get: function () { return days_in_month_mapping_1.DaysInMonthsMappingData; } });
var date_formats_1 = require("./date-formats");
Object.defineProperty(exports, "DateFormats", { enumerable: true, get: function () { return date_formats_1.DateFormats; } });
var invalid_date_1 = require("./invalid-date");
Object.defineProperty(exports, "InvalidDate", { enumerable: true, get: function () { return invalid_date_1.InvalidDate; } });

},{"./date-formats":3,"./days-in-month-mapping":4,"./invalid-date":6,"./nepali-days":7,"./nepali-months":8,"./new-year-mapping":9}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidDate = void 0;
exports.InvalidDate = 'Invalid Date';

},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NepaliDaysData = void 0;
exports.NepaliDaysData = [
    { en: 'Sunday', np: 'आइतबार' },
    { en: 'Monday', np: 'सोमबार' },
    { en: 'Tuesday', np: 'मंगलबार' },
    { en: 'Wednesday', np: 'बुधबार' },
    { en: 'Thursday', np: 'बिहिबार' },
    { en: 'Friday', np: 'शुक्रबार' },
    { en: 'Saturday', np: 'शनिबार' }
];

},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NepaliMonthsNameEn = exports.NepaliMonthsData = void 0;
exports.NepaliMonthsData = [
    { en: 'Baisakh', np: 'बैशाख', ad: 'Apr/May' },
    { en: 'Jestha', np: 'जेठ', ad: 'May/Jun' },
    { en: 'Ashad', np: 'असार', ad: 'Jun/Jul' },
    { en: 'Shrawan', np: 'श्रावण', ad: 'Jul/Aug' },
    { en: 'Bhadra', np: 'भदौ', ad: 'Aug/Sep' },
    { en: 'Ashoj', np: 'आश्विन', ad: 'Sep/Oct' },
    { en: 'Kartik', np: 'कार्तिक', ad: 'Oct/Nov' },
    { en: 'Mangsir', np: 'मंसिर', ad: 'Nov/Dec' },
    { en: 'Poush', np: 'पुष', ad: 'Dec/Jan' },
    { en: 'Magh', np: 'माघ', ad: 'Jan/Feb' },
    { en: 'Falgun', np: 'फाल्गुन', ad: 'Feb/Mar' },
    { en: 'Chaitra', np: 'चैत्र', ad: 'Mar/Apr' }
];
exports.NepaliMonthsNameEn = exports.NepaliMonthsData.map((month) => month.en);

},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewYearMappingData = void 0;
exports.NewYearMappingData = {
    '1970': '1913-04-13',
    '1971': '1914-04-13',
    '1972': '1915-04-13',
    '1973': '1916-04-13',
    '1974': '1917-04-13',
    '1975': '1918-04-12',
    '1976': '1919-04-13',
    '1977': '1920-04-13',
    '1978': '1921-04-13',
    '1979': '1922-04-13',
    '1980': '1923-04-13',
    '1981': '1924-04-13',
    '1982': '1925-04-13',
    '1983': '1926-04-13',
    '1984': '1927-04-13',
    '1985': '1928-04-13',
    '1986': '1929-04-13',
    '1987': '1930-04-13',
    '1988': '1931-04-13',
    '1989': '1932-04-13',
    '1990': '1933-04-13',
    '1991': '1934-04-13',
    '1992': '1935-04-13',
    '1993': '1936-04-13',
    '1994': '1937-04-13',
    '1995': '1938-04-13',
    '1996': '1939-04-13',
    '1997': '1940-04-13',
    '1998': '1941-04-13',
    '1999': '1942-04-13',
    '2000': '1943-04-14',
    '2001': '1944-04-13',
    '2002': '1945-04-13',
    '2003': '1946-04-13',
    '2004': '1947-04-14',
    '2005': '1948-04-13',
    '2006': '1949-04-13',
    '2007': '1950-04-13',
    '2008': '1951-04-14',
    '2009': '1952-04-13',
    '2010': '1953-04-13',
    '2011': '1954-04-13',
    '2012': '1955-04-14',
    '2013': '1956-04-13',
    '2014': '1957-04-13',
    '2015': '1958-04-13',
    '2016': '1959-04-14',
    '2017': '1960-04-13',
    '2018': '1961-04-13',
    '2019': '1962-04-13',
    '2020': '1963-04-14',
    '2021': '1964-04-13',
    '2022': '1965-04-13',
    '2023': '1966-04-13',
    '2024': '1967-04-14',
    '2025': '1968-04-13',
    '2026': '1969-04-13',
    '2027': '1970-04-14',
    '2028': '1971-04-14',
    '2029': '1972-04-13',
    '2030': '1973-04-13',
    '2031': '1974-04-14',
    '2032': '1975-04-14',
    '2033': '1976-04-13',
    '2034': '1977-04-13',
    '2035': '1978-04-14',
    '2036': '1979-04-14',
    '2037': '1980-04-13',
    '2038': '1981-04-13',
    '2039': '1982-04-14',
    '2040': '1983-04-14',
    '2041': '1984-04-13',
    '2042': '1985-04-13',
    '2043': '1986-04-14',
    '2044': '1987-04-14',
    '2045': '1988-04-13',
    '2046': '1989-04-13',
    '2047': '1990-04-14',
    '2048': '1991-04-14',
    '2049': '1992-04-13',
    '2050': '1993-04-13',
    '2051': '1994-04-14',
    '2052': '1995-04-14',
    '2053': '1996-04-13',
    '2054': '1997-04-13',
    '2055': '1998-04-14',
    '2056': '1999-04-14',
    '2057': '2000-04-13',
    '2058': '2001-04-14',
    '2059': '2002-04-14',
    '2060': '2003-04-14',
    '2061': '2004-04-13',
    '2062': '2005-04-14',
    '2063': '2006-04-14',
    '2064': '2007-04-14',
    '2065': '2008-04-13',
    '2066': '2009-04-14',
    '2067': '2010-04-14',
    '2068': '2011-04-14',
    '2069': '2012-04-13',
    '2070': '2013-04-14',
    '2071': '2014-04-14',
    '2072': '2015-04-14',
    '2073': '2016-04-13',
    '2074': '2017-04-14',
    '2075': '2018-04-14',
    '2076': '2019-04-14',
    '2077': '2020-04-13',
    '2078': '2021-04-14',
    '2079': '2022-04-14',
    '2080': '2023-04-14',
    '2081': '2024-04-13',
    '2082': '2025-04-14',
    '2083': '2026-04-14',
    '2084': '2027-04-14',
    '2085': '2028-04-13',
    '2086': '2029-04-14',
    '2087': '2030-04-14',
    '2088': '2031-04-15',
    '2089': '2032-04-15',
    '2090': '2033-04-14',
    '2091': '2034-04-14',
    '2092': '2035-04-13',
    '2093': '2036-04-14',
    '2094': '2037-04-14',
    '2095': '2038-04-14',
    '2096': '2039-04-15',
    '2097': '2040-04-13',
    '2098': '2041-04-14',
    '2099': '2042-04-14',
    '2100': '14-04-2043'
};

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.format = void 0;
const data_1 = require("./data");
const generateDateFormatOrder_1 = require("./utils/generateDateFormatOrder");
const format = (date, dateFormat) => {
    if (date.toString() === data_1.InvalidDate) {
        return data_1.InvalidDate;
    }
    let formattedDate = dateFormat;
    const year = date.getYear();
    const month = date.getMonth();
    const day = date.getDay();
    const order = (0, generateDateFormatOrder_1.generateDateFormatOrder)(dateFormat);
    order.forEach((component) => {
        if (component === 'year' && year) {
            formattedDate = formattedDate.replace('YYYY', year.toString());
            formattedDate = formattedDate.replace('YYY', year.toString().slice(-3));
            formattedDate = formattedDate.replace('YY', year.toString().slice(-2));
        }
        else if (component === 'month' && month) {
            if (data_1.NepaliMonthsNameEn[month - 1]) {
                formattedDate = formattedDate.replace('MMMM', data_1.NepaliMonthsNameEn[month - 1]);
                formattedDate = formattedDate.replace('MM', month.toString().padStart(2, '0'));
            }
        }
        else if (component === 'day' && day) {
            formattedDate = formattedDate.replace('DD', day.toString().padStart(2, '0'));
        }
    });
    return formattedDate;
};
exports.format = format;

},{"./data":5,"./utils/generateDateFormatOrder":14}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BikramSambat_1 = require("./BikramSambat");
exports.default = BikramSambat_1.BikramSambat;

},{"./BikramSambat":2}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDayValid = exports.parse = void 0;
const data_1 = require("./data");
const generateDateFormatOrder_1 = require("./utils/generateDateFormatOrder");
const parse = (dateString) => {
    for (const dateFormat of data_1.DateFormats) {
        const match = dateString.match(dateFormat.regex);
        if (match) {
            const parsedDate = {};
            const order = (0, generateDateFormatOrder_1.generateDateFormatOrder)(dateFormat.format);
            order.forEach((component, index) => {
                if (component === 'month' &&
                    data_1.NepaliMonthsNameEn.indexOf(match[index + 1]) >= 0) {
                    parsedDate[component] =
                        data_1.NepaliMonthsNameEn.indexOf(match[index + 1]) + 1;
                }
                else {
                    if (component === 'year' && match[index + 1].length < 4) {
                        if (match[index + 1].length === 2)
                            parsedDate[component] = parseInt('20' + match[index + 1]);
                        else
                            parsedDate[component] = parseInt('2' + match[index + 1]);
                    }
                    else {
                        parsedDate[component] = parseInt(match[index + 1]);
                    }
                }
            });
            if (!parsedDate.month) {
                parsedDate.month = 1;
            }
            if (!parsedDate.day) {
                parsedDate.day = 1;
            }
            if (!(0, exports.isDayValid)(parsedDate.year, parsedDate.month, parsedDate.day)) {
                return data_1.InvalidDate;
            }
            return parsedDate;
        }
    }
    return data_1.InvalidDate;
};
exports.parse = parse;
const isDayValid = (year, month, day) => {
    if (year === undefined || month === undefined || day === undefined) {
        return false;
    }
    if (year > 2100 ||
        year < 1975 ||
        month < 1 ||
        month > 12 ||
        day < 1 ||
        day > 32) {
        return false;
    }
    const daysInGivenMonth = data_1.DaysInMonthsMappingData[year][month - 1];
    if (day > daysInGivenMonth) {
        return false;
    }
    return true;
};
exports.isDayValid = isDayValid;

},{"./data":5,"./utils/generateDateFormatOrder":14}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDaysToGregorianDate = void 0;
function addDaysToGregorianDate(inputDate, daysToAdd) {
    const newDate = new Date(inputDate);
    newDate.setDate(newDate.getDate() + daysToAdd);
    return newDate;
}
exports.addDaysToGregorianDate = addDaysToGregorianDate;

},{}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDateFormatOrder = void 0;
const generateDateFormatOrder = (formatString) => {
    const orderArray = [];
    const regex = /YYYY|YYY|YY|MMMM|MM|DD/g;
    let match;
    while ((match = regex.exec(formatString)) !== null) {
        switch (match[0]) {
            case 'YYYY':
            case 'YYY':
            case 'YY':
                orderArray.push('year');
                break;
            case 'MMMM':
            case 'MM':
                orderArray.push('month');
                break;
            case 'DD':
                orderArray.push('day');
                break;
            default:
                break;
        }
    }
    return orderArray;
};
exports.generateDateFormatOrder = generateDateFormatOrder;

},{}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDaysBetweenTwoAdDates = void 0;
const MILLISECONDS_IN_A_DAY = 1000 * 60 * 60 * 24;
const getDaysBetweenTwoAdDates = (startDate, endDate) => {
    const timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(timeDiff / MILLISECONDS_IN_A_DAY);
    return diffDays;
};
exports.getDaysBetweenTwoAdDates = getDaysBetweenTwoAdDates;

},{}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDaysFromBsNewYear = void 0;
const data_1 = require("../data");
const getDaysFromBsNewYear = (year, month, day) => {
    let days = 0;
    const daysInMonthsData = data_1.DaysInMonthsMappingData[year];
    for (let i = 0; i < month - 1; i++) {
        days += daysInMonthsData[i];
    }
    days += day;
    return days;
};
exports.getDaysFromBsNewYear = getDaysFromBsNewYear;

},{"../data":5}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNewYearDateInfo = void 0;
const data_1 = require("../data");
const getNewYearDateInfo = (date) => {
    const newYearDate = Object.values(data_1.NewYearMappingData).filter((newYearDate, currentIndex) => {
        const currDate = new Date(newYearDate);
        const nextDate = new Date(Object.values(data_1.NewYearMappingData)[currentIndex + 1]);
        if (currDate <= date && date < nextDate) {
            return true;
        }
        return false;
    });
    const bsYear = Object.keys(data_1.NewYearMappingData).find((key) => data_1.NewYearMappingData[key] === newYearDate[0]);
    return {
        bsYear: Number(bsYear),
        newYearDate: new Date(newYearDate[0])
    };
};
exports.getNewYearDateInfo = getNewYearDateInfo;

},{"../data":5}]},{},[1]);
