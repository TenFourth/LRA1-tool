module.exports.switch = function(elem, flag) {
    if (flag) {
        elem.classList.add('is-active');
    } else {
        elem.classList.remove('is-active');
    }
};

module.exports.toggle = function(elem) {
    elem.classList.toggle('is-active');
};
