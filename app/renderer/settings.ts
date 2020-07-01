import { appProperties } from '../../@types/properties';

const KEY_LOCALSTORAGE = 'settings';

export class Settings {
    static save(properties: appProperties) {
        localStorage.setItem(KEY_LOCALSTORAGE, JSON.stringify(properties));
    }

    static load(): appProperties {
        const data = localStorage.getItem(KEY_LOCALSTORAGE);
        return data ? JSON.parse(data) : null;
    }
}
