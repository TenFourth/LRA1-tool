module.exports.setOnClick = function(elem, onClick) {
    elem.onclick = onClick;
    return elem;
};

module.exports.disableOnClick = function(elem, flag = true) {
    elem.style.pointerEvents = flag ? 'none' : '';
};
