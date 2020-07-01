const basic = require('../basic');

module.exports.mediaObject = function(elem, image, content, right = "") {
    const media = document.createElement('div');
    media.classList.add('media');

    media.appendChild(basic.element.newNode('div', image, {class: 'media-left'}));
    media.appendChild(basic.element.newNode('div', content, {class: 'media-content'}));
    if (right) {
        media.appendChild(basic.element.newNode('div', right, {class: 'media-right'}));
    }

    elem.appendChild(media);
};

