import { Lra1Data } from "../@types/lra1-data";

export class Lra1 {
    private static lastdata: Lra1Data = { rssi: null, received: null, from: null, error: null };

    private static getReceivedData = (line) => {
        const col = line.split(',');
        if (!col || col.length < 3) {
            Lra1.lastdata.error = 'failed to parse receive data';
            return;
        }

        Lra1.lastdata.rssi = parseInt(col[0]);
        Lra1.lastdata.from = parseInt(col[1]);
        Lra1.lastdata.received = col[2];
        Lra1.lastdata.error = null;
    }

    static isAvailable() {
        return (this.lastdata.received !== null);
    }

    static clearLastData() {
        this.lastdata.rssi = null;
        this.lastdata.received = null;
        this.lastdata.from = null;
        this.lastdata.error = null;
    }

    static parse(line: string): Lra1Data {
        if (line.charAt(0) === '@') {
            this.getReceivedData(line.substring(1));
        } else {
            this.clearLastData();
            this.lastdata.error = line;
        }

        return this.lastdata;
    }
}
