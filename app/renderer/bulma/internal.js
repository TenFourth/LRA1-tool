const basic = require('../basic');

module.exports.closeButton = function(elem, closeTimerID) {
    const button = basic.element.newNode('button', '', {class: 'delete'});
    button.onclick = function() {
        window.clearTimeout(closeTimerID);
        basic.element.remove(elem);
    };

    return button;
};
