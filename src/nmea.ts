import { Waypoint } from "../@types/waypoint";
import { Coordinate } from './coordinate';

// 拡張子パターン
const extensionPattern = /\.(nmea)$/;

interface NmeaData {
    type: string,
    checksum: string,
    data: string
}

interface dmLatLng {
    dmLat: number,
    minusLat: boolean,
    dmLng: number;
    minusLng: boolean,
}

function makeNmeaDateTime(date_str, time_str) {
    const year = parseInt("20" + date_str.substring(4, 6));
    const month = parseInt(date_str.substring(2, 4));
    const day = parseInt(date_str.substring(0, 2));
    const hour = parseInt(time_str.substring(0, 2));
    const minute = parseInt(time_str.substring(2, 4));
    const second = parseInt(time_str.substring(4));

    const d = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
    return d.getTime();  // ミリ秒
}

function zeroPadding(num: number | string, zeros: number): string {
    var padding = '';
    var minus = '';

    var num_str = (typeof num === 'string') ? num : String(num || 0);

    if (num_str.charAt(0) === '-') {
        minus = '-';
        num_str = num_str.substring(1);
    }

    for (var i = 0; i < zeros - num_str.length; i++) {
        padding += '0';
    }

    return minus + padding + num_str;
}

function toHex(decimal: number, digits = 2): string {
    return isNaN(decimal) ? null : zeroPadding(decimal.toString(16), digits)
}

function checksum(data): string {
    let sum = 0;

    for (let i = 0; i < data.length; i++) {
        sum ^= data.charCodeAt(i);
    }

    return toHex(sum);
}

function isChecksumMatch(split: NmeaData): boolean {
    if (!split.checksum) {
        return true;  // G-sensorはchecksumが付かないので無いデータは許容する
    }

    const payload = split.type + ',' + split.data;
    return (checksum(payload).toUpperCase() === split.checksum.toUpperCase());
}

function splitPayload(nmea: string): NmeaData {
    if (nmea.charAt(0) !== '$') {
        return null;
    }

    const checksumPos = nmea.indexOf('*');
    const firstCommaPos = nmea.indexOf(',', 1);
    const type = nmea.substring(1, firstCommaPos);
    if (checksumPos > 0) {
        return {
            type: type,
            checksum: nmea.substring(checksumPos + 1),
            data: nmea.substring(firstCommaPos + 1, checksumPos)
        };
    } else {
        return { type: type, checksum: "", data: nmea.substring(firstCommaPos + 1) };
    }
}

function DMtoDegree(dmLatLng: dmLatLng): Coordinate {
    const coordinate = new Coordinate();
    coordinate.fromDigreeMinute({
        latitude: dmLatLng.minusLat ? -1.0 * dmLatLng.dmLat : dmLatLng.dmLat,
        longitude: dmLatLng.minusLng ? -1.0 * dmLatLng.dmLng : dmLatLng.dmLng
    });

    return coordinate;
}

const INTERNATIONAL_NAUTICAL_MILE = 1852;

function knotsToKmh(knots: number): number {
    return knots * INTERNATIONAL_NAUTICAL_MILE / 1000;
}

export class Nmea {
    private tripId: string;  // TRIP IDは1分間隔のため、clearしないで保持したい
    private foundRMC: boolean;
    private foundGGA: boolean;
    private holdData: Waypoint;

    static extensionPattern = extensionPattern;

    private clearHoldData = () => {
        this.holdData = {
            datetime: null,
            speed: null,
            variation: null,
            coordinate: { latitude: NaN, longitude: NaN, altitude: NaN },
            gsensor: { x: NaN, y: NaN, z: NaN },
            tripId: null,
            events: null,
            dop: { h: NaN, v: NaN, p: NaN }
        };
    }

    private createNewWaypoint = (wp: Waypoint): Waypoint => {
        let ret = null;

        if (this.holdData.datetime) {
            if (this.holdData.datetime !== wp.datetime) {
                ret = Object.assign({}, this.holdData);
            }
            this.clearHoldData();
        }

        if (this.tripId) {
            this.holdData.tripId = this.tripId;
        }
        this.holdData.datetime = wp.datetime;
        this.holdData.coordinate = Object.assign({}, wp.coordinate);
        this.holdData.variation = wp.variation;
        if (this.holdData.speed === null) {
            this.holdData.speed = wp.speed;
        }

        return ret;
    }

    private getRMC = (col: Array<string>): Waypoint => {
        if (col.length <= 9) {
            return null;
        }
        this.foundRMC = true;

        if (col[1] === "A") {  // sentence status OK
            const time_str = col[0];
            const date_str = col[8];
            const coordinate = DMtoDegree({
                dmLat: parseFloat(col[2]),
                minusLat: col[3] === "S",
                dmLng: parseFloat(col[4]),
                minusLng: col[5] === "W"
            });
            const knots = parseFloat(col[6]);
            const magneticVariation = parseFloat(col[7]);

            return this.createNewWaypoint({
                datetime: makeNmeaDateTime(date_str, time_str),
                coordinate: { ...coordinate, altitude: this.holdData.coordinate.altitude },
                speed: knotsToKmh(knots),
                variation: magneticVariation
            });
        }

        return null;
    };

    private getVTG = (col: Array<string>) => {
        if (col.length > 7) {
            if (col[7].substring(0, 1) === "K") {
                this.holdData.speed = parseFloat(col[6]);
            }
        }
        return null;
    };

    private getGSA = (col: Array<string>) => {
        if (col.length > 5) {
            this.holdData.dop = {
                h: parseFloat(col[col.length - 2]),
                v: parseFloat(col[col.length - 1]),
                p: parseFloat(col[col.length - 3])
            }
        }
        return null;
    };

    private getGGA = (col: Array<string>): Waypoint => {
        if (col.length <= 8) {
            return null;
        }

        if (col[9] === 'M') {
            this.holdData.coordinate.altitude = parseFloat(col[8]);
        }
        if (isNaN(this.holdData.dop.h)) {
            this.holdData.dop.h = parseFloat(col[7]);
        }

        if (this.foundRMC === false && this.foundGGA === true) {
            const date_str = '000101';  // GGAセンテンスは日付を持たないためダミー値を入れる
            const time_str = col[0];
            const coordinate = DMtoDegree({
                dmLat: parseFloat(col[1]),
                minusLat: col[2] === "S",
                dmLng: parseFloat(col[3]),
                minusLng: col[4] === "W"
            })

            return this.createNewWaypoint({
                datetime: makeNmeaDateTime(date_str, time_str),
                coordinate: {
                    ...this.holdData.coordinate,
                    ...coordinate
                },
                speed: null,
                variation: null
            });
        }
        this.foundGGA = true;

        return null;
    };

    private getGSENSOR = (col: Array<string>) => {
        if (col.length === 3) {
            const xyz = [col[0], col[1], col[2]].map(str => parseFloat(str));
            this.holdData.gsensor = { x: xyz[0], y: xyz[1], z: xyz[2] };
        }
        return null;
    };

    private getTRIP = (col: Array<string>) => {
        if (col.length === 2) {
            this.tripId = col[0];
        }
        return null;
    };

    private getADAS = (col: Array<string>) => {
        if (col.length >= 8) {
            this.holdData.events = this.holdData.events || [];
            // col[0] は 1/10 の位置かも?
            if (col[1] === 'M') {
                this.holdData.events.push({
                    type: 'delayStart'  // 発進遅れ警告
                });
            }
            // col[2] は 1/10 の位置かも?
            if (col[3] === 'P' || col[3] === 'N') {  // 違いは不明
                const direction = col[4] === 'L' ? 'left' : 'right';  // 'L' or 'R'
                this.holdData.events.push({
                    type: 'LaneDeparture',  // 車線逸脱警告(LDW)
                    direction: direction
                });
            }
            // col[5] は 1/10 の位置かも?
            if (col[6] === 'W' || col[6] === 'H' || col[6] === 'M' || col[6] === 'L') {  // 違いは不明
                // col[6], col[7] の数値は不明
                this.holdData.events.push({
                    type: 'ForwardCollision'  // 前方衝突警告(FCW)
                });
            }
        }

        return null;
    };

    constructor(filename: string) {
        this.tripId = filename;
        this.foundRMC = false;
        this.foundGGA = false;
        this.clearHoldData();
    }

    private sentenceParser = [
        { pattern: /^G[APN]RMC/, func: this.getRMC },  // essential gps pvt (position, velocity, time) data
        { pattern: /^G[APN]GGA/, func: this.getGGA },  // essential fix data
        { pattern: /^G[APN]GSA/, func: this.getGSA },  // Dilution Of Precision
        { pattern: /^G[APN]VTG/, func: this.getVTG },  // Track made good, speed
        { pattern: /^GSENS/, func: this.getGSENSOR },  // G-sensor (DriveRecorder proprietary format)
        { pattern: /^GTRIP/, func: this.getTRIP },     // Trip identify (DriveRecorder proprietary format)
        { pattern: /^JKDSA/, func: this.getADAS }      // Driving Safety Assistant (DriveRecorder proprietary format)
    ];

    parseNmeaLine = (nmea: string): Waypoint | null => {
        const split = splitPayload(nmea);
        if (!split || isChecksumMatch(split) === false) {
            return null;  // checksumが一致しないデータは無視する
        }

        for (const parser of this.sentenceParser) {
            if (parser.pattern.test(split.type)) {
                const col = split.data.split(",");
                return col ? parser.func(col) : null;
            }
        }
        return null;
    }

    /*
    get = (data: string): Waypoint[] => {
        const waypoints = common.parseEachLines(data, this.parseNmeaLine);
        if (waypoints.length === 0 || (waypoints[waypoints.length - 1].datetime !== this.holdData.datetime)) {
            waypoints.push({ ...this.holdData });
        }

        return waypoints;
    }
    */
}
