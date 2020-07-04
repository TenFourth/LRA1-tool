const { dialog, ipcMain } = require('electron');

import { Convert } from './convert';
import { Logging } from './logging';
import { Serial } from './serial';

const serial = {
    gps: new Serial(),
    lora: new Serial()
};

// renderer から main プロセスへのデータ受取り
ipcMain.on('serialList', (event, arg) => {
    Serial.list().then(ports => {
        event.reply('serialList-reply', ports);
    }).catch(message => {
        event.reply('error', message || 'シリアル通信ポートの一覧取得に失敗しました');
    });
});

ipcMain.on('baudrateList', (event, arg) => {
    event.reply('baudrateList-reply', Serial.boudRates);
});

ipcMain.on('connect', (event, arg) => {
    serial[arg.module].connect({
        baudRate: arg.baudRate,
        autoOpen: true,
        path: arg.path,
        on: (data: string) => {
            Logging.data(event, arg.module, data);
            event.reply(arg.module + '-data-received', data);
        }
    }).catch(message => {
        event.reply('error', message || '予期しないエラーが発生しました');
    });
});

ipcMain.on('disconnect', (event, arg) => {
    serial[arg].disconnect();
    event.reply(arg + '-disconnect-reply', 'ok');
});

ipcMain.on('openSavePathDialog', (event, arg) => {
    const path = dialog.showOpenDialogSync({ properties: ['openDirectory', 'createDirectory', 'promptToCreate'] });
    event.reply('openSavePathDialog-reply', path);
});

ipcMain.on('logging', (event, arg) => {
    Logging.toggle(event, arg.savePath);
    event.reply('logging-reply', Logging.status);
});

ipcMain.on('convertToGeoJson', (event, arg: string) => {
    if (!arg) {
        event.reply('error', 'ファイルを選択してください');
    }

    try {
        Convert.toGeoJson(arg);
    } catch (error) {
        event.reply('error', error.message);
    }
})
