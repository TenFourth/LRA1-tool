import Vue from 'vue/dist/vue';
import 'bulma/css/bulma.min.css';
const bulmaRender = require('./bulma');

require('./webfont.js');
import './api-receive';
import { ApiSend } from './api-send';
import { ModalContent } from './modal-content';
import { Settings } from './settings';

const modalContent = new ModalContent();

window.renderer = {
    serialList: new Array(),
    baudrates: new Array(),
    selectedSavePath: "",
    onError: () => { },
    onListRefresh: () => { },
    onSetSavePath: () => { }
};

window.addEventListener('DOMContentLoaded', () => {
    ApiSend.connect();
});

document.getElementById('buttonLogging').addEventListener("click", () => {
    ApiSend.logging({ savePath: Settings.load().savePath });
});

document.getElementById('buttonSettings').addEventListener("click", () => {
    ApiSend.disconnect();
    ApiSend.refreshList();
    modalContent.setting();
});

window.renderer.onError = (message) => {
    bulmaRender.elements.notification('error', message, 5000);
}
