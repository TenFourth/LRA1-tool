const basic = require('../basic');
const internal = require('./internal.js');

module.exports.notification = function(level, message, autoClose=3000, showCloseButton=true) {
    let closeTimerID = null;
    const c = {
        info:    {class: "notification is-info"},
        warning: {class: "notification is-warning"},
        error:   {class: "notification is-danger"}
    };

    const notif = basic.element.newNode('div', message, c[level]);

    if (!isNaN(autoClose)) {
        closeTimerID = setTimeout(function() { basic.element.remove(notif); }, autoClose);
    }

    if (showCloseButton === true) {
        notif.appendChild(internal.closeButton(notif, closeTimerID));
    }

    return document.body.insertBefore(notif, document.body.firstChild);
};

module.exports.table = function(names, values) {
    return basic.table(names, values, 'table is-fullwidth');
};
