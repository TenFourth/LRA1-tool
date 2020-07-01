const value = require('./value');

const datetime_pattern = /((?:[12]\d{3})|(?:\d{2}))[\-\/\.]([01]?\d)[\-\/\.]([0123]?\d)[ _\-T]([012]?\d):([0-5]?\d):([\d\.]+)((?:Z|(?:\+|\-[012]\d:[0-5]\d))?)/;
const prune_datetime_pattern = /((?:[12]\d{3})|(?:\d{2}))([01]?\d)([0123]?\d)[ _\-]([012]?\d)([0-5]?\d)([0-5]?[\d])/;

function getDateStr(d, delim) {
    const year  = value.zeroPadding(d.getUTCFullYear(), 4);
    const month = value.zeroPadding(d.getUTCMonth() + 1, 2);
    const date  = value.zeroPadding(d.getUTCDate(), 2);

    return year + delim + month + delim + date;
}

function hhmmss(hour, min, sec, delim) {
    const h = value.zeroPadding(Math.floor(hour), 2);
    const m = value.zeroPadding(Math.floor(min), 2);
    const s = value.zeroPadding(Math.floor(sec), 2);

    return h + delim + m + delim + s;
}

function ms(msec) {
    return "." + value.zeroPadding(Math.floor(msec), 3);
}

function getTimeStr(d, delim, add_msec) {
    const hour  = d.getUTCHours();
    const min   = d.getUTCMinutes();
    const sec   = d.getUTCSeconds();

    return add_msec ?
        hhmmss(hour, min, sec, delim) + ms(d.getUTCMilliseconds()) :
        hhmmss(hour, min, sec, delim);
}

function getEpochSecondPrecision(epoc) {
    // 32Bit整数より大きければミリ秒精度とみなして桁を落とす
    return (epoc > 4294967295) ? (epoc / 1000) : epoc;
}

function getEpochMilliPrecision(epoc) {
    // 32Bit整数に収まっていれば秒精度とみなして桁を増やす
    // 100000000 は '1973/03/03 18:46:40 JST' これより小さい値は実際あまり使われないだろうから変換を除外する
    return (100000000 < epoc && epoc <= 4294967295) ? (epoc * 1000) : epoc;
}

function toUTCString(epoc, add_msec = true) {
    const d = new Date(value.replaceNanToZero(epoc));

    return getDateStr(d, "/") + " " + getTimeStr(d, ":", add_msec);
}

function getDateFromDatetimeString(datetime_str) {
    var d;

    if (!datetime_str) {
        return NaN;
    }

    let dt_match = datetime_str.match(datetime_pattern) || datetime_str.match(prune_datetime_pattern);
    if (dt_match === null) {
        return NaN;
    }

    const sec = Math.floor(dt_match[6]);
    const milisec = Math.floor((dt_match[6] * 1000) - (sec * 1000));

    d = new Date(Date.UTC(dt_match[1], dt_match[2] - 1, dt_match[3], dt_match[4], dt_match[5], sec, milisec));

    return d.getTime();  // ミリ秒
}

function roundMilliEpoc(milli_epoc) {
    if (isNaN(milli_epoc) === true) {
        return NaN;
    }

    return Math.floor(milli_epoc / 1000) * 1000;
}

module.exports.getFormatTime = function(hour, min, sec, milisec) {
    const msec = isNaN(milisec) === false ? ms(milisec) : "";

    return hhmmss(hour, min, sec, ":") + msec;
};

module.exports.isValidString = function(datetime_str) {
    return datetime_pattern.test(datetime_str);
};

module.exports.toUTCString = toUTCString;

module.exports.toString = function(epoc, add_msec = true) {
    const tz_offset_msec = (new Date()).getTimezoneOffset() * 60 * 1000;

    return toUTCString(epoc - tz_offset_msec , add_msec);
};

module.exports.toPruneString = function(epoc, space = "-") {
    const tz_offset_msec = (new Date()).getTimezoneOffset() * 60 * 1000;
    const d = new Date(value.replaceNanToZero(epoc - tz_offset_msec));

    return getDateStr(d, "") + space + getTimeStr(d, "", false);
};

module.exports.toRFC3339UTC = function(epoc) {
    const d = new Date(value.replaceNanToZero(epoc));

    return getDateStr(d, "-") + "T" + getTimeStr(d, ":", false) + "Z";
};

module.exports.getDateFromDatetimeString = getDateFromDatetimeString;

module.exports.roundMilliEpoc = roundMilliEpoc;

module.exports.isMatchInSeconds = function(epoc1, epoc2) {
    const dt1 = roundMilliEpoc(epoc1);
    const dt2 = roundMilliEpoc(epoc2);

    if (isNaN(dt1) === true || isNaN(dt2) === true) {
        return false;
    }

    return dt1 === dt2 ? true : false;
};

// Epoch時刻を求める。秒以下は小数で表す。秒単位にするにはMath.floor()で丸めて下さい
module.exports.getEpoch = function(datetime) {
    var ret = NaN;

    if (typeof datetime === "number") {
        ret = getEpochSecondPrecision(datetime);
    } else if (typeof datetime === "string") {
        ret = getDateFromDatetimeString(datetime) / 1000;
    }

    return ret;
};

module.exports.getEpochFromEstimatedDateOrder = function(dateString, timeString = '') {
    let year, month, day;
    let hour = 0;
    let minute = 0;
    let second = 0;

    const d = dateString.split(/[-\/\.]/);
    if (!d || d.length !== 3) {
        return NaN;
    }

    if (d[0] > 31) {
        // 先頭が年 -> YMD
        year  = d[0];
        month = d[1];
        day   = d[2];
    } else if (d[0] > 12) {
        // 先頭が日(13以上) -> DMY
        //   12日未満はMDYとして扱われる問題あり
        year  = d[2];
        month = d[1];
        day   = d[0];
    } else {
        year  = d[2];
        month = d[0];
        day   = d[1];
    }

    if (timeString) {
        const t = timeString.split(':');
        hour   = t[0] ? t[0] : 0;
        minute = t[1] ? t[1] : 0;
        second = t[2] ? t[2] : 0;
    }

    const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));

    return date.getTime();  // ミリ秒
};
