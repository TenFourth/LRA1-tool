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
};

function tabContent(id) {
    document.getElementById('logging').style.display = 'none';
    document.getElementById('convert').style.display = 'none';
    bulmaRender.active.switch(document.getElementById('tab_logging'), false);
    bulmaRender.active.switch(document.getElementById('tab_convert'), false);

    document.getElementById(id).style.display = 'block';
    bulmaRender.active.switch(document.getElementById('tab_' + id), true);
}

document.getElementById('anchorLogging').addEventListener("click", () => {
    tabContent('logging');
});

document.getElementById('anchorConvert').addEventListener("click", () => {
    tabContent('convert');
});

// GeoJSON変換のCSVファイルを参照した時
document.getElementById('convert_csv_input').addEventListener('change', (evt) => {
    const files = evt.target.files || evt.dataTransfer.files;   // files form or drag

    if (!files || files.length === 0) {
        return;
    }

    const file = files[0];  // TODO: 複数のファイルが選択されていても最初のファイルだけ扱う
    document.getElementById('convert_csv_filename').innerText = file.path;
}, false);

document.getElementById('buttonConvert').addEventListener('click', () => {
    const csvPath = document.getElementById('convert_csv_filename').innerText;
    ApiSend.convertToGeoJson(csvPath);
});
