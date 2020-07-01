const bulmaRender = require('./bulma');
const htmlRender = require('./basic');
import { dom } from '@fortawesome/fontawesome-svg-core';
import Vue from 'vue';
import { ApiSend } from './api-send';
import { Settings } from './settings';
import { SerialProperties } from '../../@types/properties';

declare var renderer;

interface VueObjects {
    gpsComPort: Vue,
    loraComPort: Vue,
    gpsBaudrate: Vue,
    loraBaudrate: Vue,
    savePath: Vue,
}

let vueObjects: VueObjects;

export class ModalContent {
    private footerButtons = (okFunc, cancelFunc) => {
        const foot = document.createElement('div');
        foot.classList.add('field');
        foot.classList.add('is-grouped');
        foot.classList.add('is-grouped-right');

        const okButton = bulmaRender.button.okButton('OK', () => {
            this.disableFooterButtons(true);
            okFunc();
        });
        okButton.id = 'footerOkButton';

        const control1 = document.createElement('div');
        control1.classList.add('control');
        control1.appendChild(okButton);
        foot.appendChild(control1);

        const cancelButton = bulmaRender.button.cancelButton('キャンセル', () => {
            this.disableFooterButtons(false);
            cancelFunc();
        });
        cancelButton.id = 'footerCancelButton';

        const control2 = document.createElement('div');
        control2.classList.add('control');
        control2.appendChild(cancelButton);
        foot.appendChild(control2);

        return foot;
    }

    private disableFooterButtons = (flag = false) => {
        const okButton = document.getElementById('footerOkButton');
        const cancelButton = document.getElementById('footerCancelButton');
        bulmaRender.button.loading(okButton, flag);
        //cancelButton.disabled = flag;
    }

    private openModal = (elem) => {
        document.body.appendChild(elem);
        bulmaRender.active.switch(elem, true);
    }

    private closeModal = (elem) => {
        htmlRender.element.remove(elem);
    }

    private addDisconnectedSaveDevice(velem: Vue, compath: string) {
        if (!compath) {
            return;
        }

        let find = false;
        velem.$data.options.forEach((opt) => {
            if (opt.value === compath) {
                find = true;
            }
        });

        if (find === false) {
            velem.$data.options.push({
                text: compath + "(未接続)",
                value: compath
            });
        }
    }

    private saveSettings = () => {
        const gps: SerialProperties = {
            path: vueObjects.gpsComPort.$data.selected,
            baudrate: vueObjects.gpsBaudrate.$data.selected
        };
        const lora: SerialProperties = {
            path: vueObjects.loraComPort.$data.selected,
            baudrate: vueObjects.loraBaudrate.$data.selected
        }
        const savePath: string = vueObjects.savePath.$data.message;

        Settings.save({ device: { gps, lora }, savePath })
    }

    private loadSettings = () => {
        const settings = Settings.load();
        if (settings) {
            this.addDisconnectedSaveDevice(vueObjects.gpsComPort, settings.device.gps.path);
            this.addDisconnectedSaveDevice(vueObjects.loraComPort, settings.device.lora.path);

            vueObjects.gpsComPort.$data.selected = settings.device.gps.path;
            vueObjects.gpsBaudrate.$data.selected = settings.device.gps.baudrate;
            vueObjects.loraComPort.$data.selected = settings.device.lora.path;
            vueObjects.loraBaudrate.$data.selected = settings.device.lora.baudrate;
            vueObjects.savePath.$data.message = settings.savePath;
        }
    }

    private refreshList = () => {
        vueObjects.gpsComPort.$data.options = [...renderer.serialList];
        vueObjects.loraComPort.$data.options = [...renderer.serialList];
        vueObjects.gpsBaudrate.$data.options = renderer.baudrates;
        vueObjects.loraBaudrate.$data.options = renderer.baudrates;
        this.loadSettings();
    }

    private setSavePath = () => {
        if (renderer.selectedSavePath) {
            vueObjects.savePath.$data.message = renderer.selectedSavePath[0];
        }
    }

    setting() {
        let cardElement;
        const cardContent = document.createElement('form');
        cardContent.innerHTML = '<div class="field"><label class="label">GPS</label>'
            + '<div class="field-body"><div class="field is-grouped">'
            + '<div class="control">Port <div class="select is-small"><select id="gpsComPort" v-model="selected"><option v-for="option in options" v-bind:value="option.value">{{ option.text }}</option></select></div></div>'
            + '<div class="control">Baudrate <div class="select is-small"><select id="gpsBaudRate" v-model="selected"><option v-for="option in options" v-bind:value="option.value">{{ option.text }}</option></select></div></div>'
            + '</div></div></div>'
            + '<div class="field"><label class="label">LoRa</label>'
            + '<div class="field-body"><div class="field is-grouped">'
            + '<div class="control">Port <div class="select is-small"><select id="loraComPort" v-model="selected"><option v-for="option in options" v-bind:value="option.value">{{ option.text }}</option></select></div></div>'
            + '<div class="control">Baudrate <div class="select is-small"><select id="loraBaudRate" v-model="selected"><option v-for="option in options" v-bind:value="option.value">{{ option.text }}</option></select></div></div>'
            + '</div></div></div>'
            + '<div class="field"><label class="label">ログ出力先</label><div class="field has-addons"><div class="control is-expanded"><input class="input is-small" id="savePath" v-model="message" type="text" placeholder="Select a directory"></div>'
            + '<div class="control"><a class="button is-link is-small" id="savePathDialog"><i class="far fa-folder-open"></i>参照</a></div></div></div>';

        const foot = this.footerButtons(() => {
            //ok
            this.saveSettings();
            ApiSend.connect();
            this.closeModal(cardElement);
        }, () => {
            ApiSend.connect();
            this.closeModal(cardElement);
        });

        cardElement = bulmaRender.components.modalCard("設定", cardContent, foot, false);
        this.openModal(cardElement);

        vueObjects = {
            gpsComPort: new Vue({
                el: '#gpsComPort',
                data: {
                    selected: '',
                    options: []
                }
            }),
            loraComPort: new Vue({
                el: '#loraComPort',
                data: {
                    selected: '',
                    options: []
                }
            }),
            gpsBaudrate: new Vue({
                el: '#gpsBaudRate',
                data: {
                    selected: '',
                    options: renderer.baudrates
                }
            }),
            loraBaudrate: new Vue({
                el: '#loraBaudRate',
                data: {
                    selected: '',
                    options: renderer.baudrates
                }
            }),
            savePath: new Vue({
                el: '#savePath',
                data: {
                    message: '',
                }
            })
        };
        renderer.onListRefresh = this.refreshList;
        renderer.onSetSavePath = this.setSavePath;

        document.getElementById('savePathDialog').addEventListener("click", () => {
            ApiSend.openSavePathDialog();
        });

        dom.i2svg();
    }
}
