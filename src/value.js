function getMin(value, min) {
    return isNaN(min) ? value : (min > value ? value : min);
}

function getMax(value, max) {
    return isNaN(max) ? value : (max < value ? value : max);
}

function round(value, round_digit) {
    const shift = Math.pow(10, replaceNanToZero(round_digit));

    return Math.floor(value * shift) / shift;
}

function replaceNanToZero(value) {
    var ret = 0;
    if (value) {
        ret = parseFloat(value.trim ? value.trim() : value);
        if (isNaN(ret) === true) {
            ret = 0;
        }
    }
    return ret;
}

module.exports.replaceNanToZero = replaceNanToZero;

module.exports.zeroPadding = function(num, zeros) {
    var padding = '';
    var minus = '';

    var num_str = (typeof num === 'string') ? num : String(num || 0);

    if (num_str.charAt(0) === '-') {
        minus = '-';
        num_str = num_str.substring(1);
    }

    for (var i=0; i<zeros - num_str.length; i++) {
        padding += '0';
    }

    return minus + padding + num_str;
};

module.exports.percent = function(value, total_count, round_digit) {
    if (total_count === 0) {
        return 0;
    }

    const percent = (value / total_count) * 100;

    return round(percent, round_digit);
};

// 指定した小数部桁数で切り捨てする
module.exports.round = round;

// value を最小値から最大値の間に収めるように返す
module.exports.normalize = function(input, min, max) {
    if (isNaN(input) === true) {
        return min;
    }

    return input > max ? max : (input < min ? min : input);
};

module.exports.setMinMax = function(value, obj) {
    obj.min = getMin(value, obj.min);
    obj.max = getMax(value, obj.max);
};

// Math.min() / Math.max() では NaN の値が含まれると NaN になるが、
// この処理では NaN は無視して算出されるのが異なる
// 大小比較で value が NaN の時は常に false となる
module.exports.getMin = getMin;
module.exports.getMax = getMax;

// 2つの値の最大公約数を求める 見つからない場合は0
module.exports.getGcd = function(a, b) {
    if (!a || !b) {
        return 0;
    }

    while (a != b) {
        const r = Math.abs(a - b);
        a = Math.min(a, b);
        b = r;
    }

    return a;
};

// CSV等の区切り文字を ',' に統一する
module.exports.replaceSeparator = function(string) {
    return string ? string.replace(/[\t ]/g, ',') : "";
};

// 改行コードを `\n` に統一する
module.exports.fixNewLine = function(string) {
    return string ? string.replace(/(\r\n|\r|\n)/g, '\n') : "";
};

// SI接頭辞を付けて数値を短く表現する
module.exports.makeMetricPrefix = function(value, binary = false) {
    const units = ['K', 'M', 'G', 'T', 'P'];
    const iec = binary ? 'i' : '';
    const multiplier = binary ? 1024 : 1000;

    for (let i=units.length; i>0; i--) {
        if (value >= Math.pow(multiplier, i)) {
            return String(Math.floor(value / Math.pow(multiplier, i))) + units[i - 1] + iec;
        }
    }

    return String(Math.floor(value));
};

module.exports.uuid = function() {
    var uuid = "";
    for (var i=0; i<32; i++) {
        const random = Math.random() * 16 | 0;
        if (i == 8 || i == 12 || i == 16 || i == 20) {
            uuid += "-";
        }
        uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
    }
    return uuid;
};
