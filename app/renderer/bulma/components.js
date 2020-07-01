const basic = require('../basic');
const active = require('./active.js');

// navbarのメニュー開閉イベント
function addNavbarBurgerListener() {
    // Get all "navbar-burger" elements
    const navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);

    // Check if there are any navbar burgers
    if (navbarBurgers.length > 0) {

        // Add a click event on each of them
        navbarBurgers.forEach( el => {
            el.addEventListener('click', () => {
                toggleNavBurger(el);
            });
        });
    }
}

function toggleNavBurger(element) {
    // Get the target from the "data-target" attribute
    const target = element.dataset.target;
    const $target = document.getElementById(target);

    // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
    active.toggle(element);
    active.toggle($target);
}

// DOMツリーが構築された時点で呼ばれる。画像やスタイルシートの読み込みは未完了
document.addEventListener('DOMContentLoaded', () => {
    addNavbarBurgerListener();
});

module.exports.toggleNavBurger = toggleNavBurger;

module.exports.switchNavBurger = function(element, flag = true) {
    const target = element.dataset.target;
    const $target = document.getElementById(target);

    active.switch(element, flag);
    active.switch($target, flag);
}

module.exports.card = function(cards) {
    const columns = document.createElement('div');
    columns.classList.add('columns');

    for (let i=0; i<cards.length; i++) {
        const column = document.createElement('div');
        column.classList.add('column');
        column.classList.add('is-one-fifth');

        const card = document.createElement('div');
        card.classList.add('card');

        const c = cards[i];
        if (c.image) {
            card.appendChild(basic.element.newNode('div', c.image, {class: 'card-image'}));
        }
        if (c.content) {
            card.appendChild(basic.element.newNode('div', c.content, {class: 'card-content'}));
        }

        column.appendChild(card);
        columns.appendChild(column);
    }

    return columns;
};

module.exports.modal = function(content, showCloseButton=true) {
    const modal = basic.element.newNode('div', '', {class: 'modal'});
    modal.appendChild(basic.element.newNode('div', '', {class: 'modal-background'}));
    modal.appendChild(basic.element.newNode('div', content, {class: 'modal-content'}));

    if (showCloseButton === true) {
        const button = basic.element.newNode('button', '', {class: 'modal-close is-large'});
        button.onclick = function() {
            active.switch(modal, false);
        };
        modal.appendChild(button);
    }

    return modal;
};

module.exports.modalCard = function(title, content, footer = "", showCloseButton=true) {
    const modal = basic.element.newNode('div', '', {class: 'modal'});
    modal.appendChild(basic.element.newNode('div', '', {class: 'modal-background'}));

    const cardBody = basic.element.newNode('div', '', {class: 'modal-card'});
    const header = basic.element.newNode('header', '<p class="modal-card-title">' + title + '</p>', {class: 'modal-card-head'});
    if (showCloseButton === true) {
        const button = basic.element.newNode('button', '', {class: 'delete'});
        button.onclick = function() {
            active.switch(modal, false);
        }
        header.appendChild(button);
    }
    cardBody.appendChild(header);
    cardBody.appendChild(basic.element.newNode('section', content, {class: 'modal-card-body'}))+
    cardBody.appendChild(basic.element.newNode('footer', footer, {class: 'modal-card-foot'}));

    modal.appendChild(cardBody);

    return modal;
};
