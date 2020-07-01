const datetime = require('./datetime.js');

import { Nmea } from './nmea';
import { Lra1 } from "./lra1";
import { Coordinate } from './coordinate';
import { Lra1Data } from '../@types/lra1-data';
import fs from 'fs';
import path from 'path';

const nmea = new Nmea('gnss.nmea');
const COORDINATE_SURVIVE_MSEC = 3000;

export class Logging {
    private static coordinate = new Coordinate();
    private static coordClearTimer;
    private static speed: number;
    static status: boolean = false;  // ログ記録中(true)/停止
    static logfile: string = '';

    private static append = (received: Lra1Data) => {
        if (Logging.status === false) {
            return;
        }

        let line = datetime.toString(new Date(), false) + ',';
        line += Logging.coordinate.isValid() ? `${Logging.coordinate.latitude},${Logging.coordinate.longitude},${Logging.speed},` : ',,,';
        line += !received.error ? `${received.rssi},"${received.received}",,` : `,"","${received.error}",`;
        line += '\r\n';

        //console.log(line);
        fs.appendFileSync(Logging.logfile, line);
    };

    private static initialize = (event: any, savePath: string) => {
        clearTimeout(Logging.coordClearTimer);
        Logging.coordinate.clear();

        try {
            Logging.logfile = path.join(savePath, datetime.toPruneString(new Date(), '-') + '.csv');
            fs.writeFileSync(Logging.logfile, 'datetime,latitude,longitude,speed,rssi,data,errorMessage\r\n');
            Logging.status = true;
        } catch (error) {
            Logging.status = false;
            event.reply('error', error.message);
        }
    };

    static toggle(event: any, savePath: string) {
        this.status = !this.status;
        if (this.status) {
            this.initialize(event, savePath);
        }
    }

    static start(event: any, savePath: string) {
        this.initialize(event, savePath);
    }

    static stop() {
        this.status = false;
    }

    static data(event: any, module: string, data: string) {
        if (module === "lora") {
            const received = Lra1.parse(data);
            event.reply('lora-received', received);

            try {
                this.append(received);  // ログファイルに書き込む
            } catch (error) {
                event.reply('error', error.message);
            }
        } else if (module === 'gps') {
            const waypoint = nmea.parseNmeaLine(data);
            if (waypoint) {
                const ret = {
                    datetime: datetime.toString(waypoint.datetime, false),
                    latitude: waypoint.coordinate.latitude,
                    longitude: waypoint.coordinate.longitude
                }
                event.reply('gps-received', ret);
                // console.log(data);

                this.coordinate.latitude = waypoint.coordinate.latitude;
                this.coordinate.longitude = waypoint.coordinate.longitude;
                this.speed = waypoint.speed;

                // 一定時間測位が途切れたらclearする
                clearTimeout(this.coordClearTimer);
                this.coordClearTimer = setTimeout(this.coordinate.clear, COORDINATE_SURVIVE_MSEC);
            }
        }
    }
}
