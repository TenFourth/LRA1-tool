import { Settings } from './settings';

declare var api;  // window.api -> api

export class ApiSend {
    static connect() {
        const settings = Settings.load();
        if (!settings) {
            return;
        }

        api.send('connect', {
            module: 'gps',
            baudRate: settings.device.gps.baudrate,
            path: settings.device.gps.path
        });
        api.send('connect', {
            module: 'lora',
            baudRate: settings.device.lora.baudrate,
            path: settings.device.lora.path
        });
    }

    static disconnect() {
        api.send('disconnect', 'gps');
        api.send('disconnect', 'lora');
    }

    static refreshList() {
        api.send('serialList');
        api.send('baudrateList');
    }

    static openSavePathDialog() {
        api.send('openSavePathDialog', '');
    }

    static logging(args) {
        api.send('logging', args);
    }
}
