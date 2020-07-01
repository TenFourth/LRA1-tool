const basic = require('../basic');

module.exports.formField = function(label, control, help = null) {
    const field = document.createElement('div');
    field.classList.add('field');

    field.appendChild(basic.element.newNode('label', label, {class: 'label'}));
    field.appendChild(basic.element.newNode('div', control, {class: 'control'}));
    if (help) {
        field.appendChild(help);
    }

    return field;
};

module.exports.formHelp = function(type, message) {
    const help = basic.element.newNode('p', message, {class: 'help'});
    switch(type) {
    case "success":
        help.classList.add('is-success');
        break;
    case "failure":
        help.classList.add('is-danger');
        break;
    }

    return help;
};

module.exports.file = function(icon, label, name) {
    const fileCta = basic.element.newNode('span', '', {class: 'file-cta'});

    if (icon) {
        fileCta.appendChild(basic.element.newNode('span', icon, {class: 'file-icon'}));
    }
    fileCta.appendChild(basic.element.newNode('span', label, {class: 'file-label'}));

    const l = basic.element.newNode('label', '', {class: 'file-label'});
    l.appendChild(basic.element.newNode('input', '', {class: 'file-input', type: 'file', name: name}));
    l.appendChild(fileCta);
    l.appendChild(basic.element.newNode('span', '', {class: 'file-name'}));

    const div = basic.element.newNode('div', '', {class: 'file has-name is-fullwidth'});
    div.appendChild(l);

    return div;
};
