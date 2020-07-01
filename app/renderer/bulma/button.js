const basic = require('../basic');

function button(content, opt) {
    return basic.element.newNode("button", content, opt);
}

module.exports.okButton = function(text, onClick) {
    return basic.event.setOnClick(button(text, {class: "button is-link"}), onClick);
};

module.exports.cancelButton = function(text, onClick) {
    return basic.event.setOnClick(button(text, {class: "button"}), onClick);
};

module.exports.loading = function(element, flag = true) {
    if (flag === true) {
        element.classList.add('is-loading');
    } else {
        element.classList.remove('is-loading');
    }

    element.disabled = flag;
};
