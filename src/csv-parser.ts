const datetime = require('./datetime.js');
import { Waypoint } from '../@types/waypoint.js';

const splitters = [',', '\t', ' '];  /* カンマ、タブ、空白文字の区切りに対応 */

const extensionPattern = /\.(csv|tsv|logg)$/;

function pushWaypoint(array, waypoint) {
    if (waypoint) {
        array.push(waypoint);
    }
}

function parseEachLines(data, parse_func) {
    let waypoints = [];

    let sp = 0;
    while (data && sp < data.length) {
        var ep = data.indexOf("\n", sp);
        if (ep < 0) {
            ep = data.length;
        }

        const line = data.substring(sp, ep).trim();
        if (line) {
            pushWaypoint(waypoints, parse_func(line));
        }

        sp = ep + 1;
    }

    return waypoints;
};

export class CsvParser {
    private holdDate: string;
    private holdTime: string;
    private dataSplitter: string;
    private fileName: string;

    static extensionPattern = extensionPattern;

    constructor(fileName: string) {
        this.fileName = fileName;
    }

    private columnOrder = {
        date: NaN,
        time: NaN,
        datetime: NaN,
        latitude: NaN,
        longitude: NaN,
        altitude: NaN,
        speed: NaN,
        variation: NaN,
        dop_h: NaN,
        dop_v: NaN,
        dop_p: NaN,
        gsensor_x: NaN,
        gsensor_y: NaN,
        gsensor_z: NaN
    };

    private clearOrder = () => {
        for (const c in this.columnOrder) {
            this.columnOrder[c] = NaN;
        }
    }

    private clearHoldData = () => {
        this.holdDate = '';
        this.holdTime = '';
    }

    private dataTrim = (col) => {
        const v = col.trim();
        return v.replace(/^"?(.*?)"?$/, '$1');
    }

    private setSplitter = (line) => {
        for (const s of splitters) {
            if (line.indexOf(s) >= 0) {
                this.dataSplitter = s;
                return;
            }
        }

        throw new Error('データの区切りを見つけられませんでした');
    }

    private getOrders = (csvHeader) => {
        const col = csvHeader.split(this.dataSplitter);
        if (!col || col.length < 2) {
            return;
        }

        for (let i = 0; i < col.length; i++) {
            const name = this.dataTrim(col[i].toLowerCase());  // カラム名を小文字に正規化する
            this.columnOrder[name] = i;  // 未知のカラムもオブジェクトに含める
        }
    }

    private obj = (o, value, name) => {
        if (!o) {
            o = new Object();
        }

        o[name] = value;

        return o;
    }

    private getStringOrFloat = (columnValue) => {
        if (columnValue.match(/^\s*?["'].*?["']\s*?$/)) {
            // 引用符で括られていたら文字列とする
            return String(this.dataTrim(columnValue));
        } else {
            return parseFloat(this.dataTrim(columnValue));
        }
    }

    private getDatetime = (name, value) => {
        switch (name) {
            case 'date':
                this.holdDate = value;
                break;
            case 'time':
                this.holdTime = value;
                break;
            case 'datetime':
                return datetime.getDateFromDatetimeString(value);
        }

        if (this.holdDate && this.holdTime) {
            return datetime.getEpochFromEstimatedDateOrder(this.holdDate, this.holdTime);
        }

        return NaN;
    }

    private setWaypoint = (waypoint, columnValue, name) => {
        const value = this.dataTrim(columnValue);

        switch (name) {
            case 'datetime': case 'date': case 'time':
                waypoint.datetime = this.getDatetime(name, value);
                break;
            case 'latitude': case 'longitude': case 'altitude':
                waypoint.coordinate = this.obj(waypoint.coordinate, parseFloat(value), name);
                break;
            case 'dop_h': case 'dop_v': case 'dop_p': case 'gsensor_x': case 'gsensor_y': case 'gsensor_z':
                {
                    const ep = name.indexOf('_');
                    const objName = name.substring(0, ep);
                    waypoint[objName] = this.obj(waypoint[objName], parseFloat(value), name.charAt(ep + 1));
                    break;
                }
            default:
                waypoint[name] = this.getStringOrFloat(columnValue);
        }
    }

    private getColumnName = (order) => {
        for (const o in this.columnOrder) {
            if (this.columnOrder[o] === order) {
                return o;
            }
        }

        return null;
    }

    private getLineValues = (csvLine: string) => {
        const col = csvLine.split(this.dataSplitter);
        if (!col || col.length < 2) {
            return null;
        }

        const waypoint = new Object();
        for (let i = 0; i < col.length; i++) {
            const name = this.getColumnName(i);
            if (name) {
                this.setWaypoint(waypoint, col[i], name);
            }
        }

        this.clearHoldData();

        return waypoint;
    }

    getWaypoints(textData: string): Array<Waypoint> {
        this.clearOrder();
        this.clearHoldData();

        const ep = textData.indexOf('\n');
        if (ep < 0) {
            return [];
        }

        const csvHeader = textData.substring(0, ep);
        const csvBody = textData.substring(ep + 1);

        this.setSplitter(csvHeader);  // 最初の行でデータの区切り文字を決定する
        this.getOrders(csvHeader);

        return parseEachLines(csvBody, this.getLineValues);
    }
}
