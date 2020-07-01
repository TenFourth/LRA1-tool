import { Coordinate as Coordinate_t } from '../@types/coordinate';

export class Coordinate implements Coordinate_t {
    latitude: number;
    longitude: number;
    altitude: number;

    private DMtoDegree = (digreeMinute: number): number => {
        const dm = isNaN(digreeMinute) ? 0 : digreeMinute;
        const dd = Math.floor(dm / 100);
        const mm = dm - (dd * 100);

        return dd + (mm / 60);
    };

    constructor(coord?: Coordinate_t) {
        if (coord) {
            for (const key in coord) {
                this[key] = coord[key];
            }
        } else {
            this.clear();
        }
    }

    clear() {
        this.latitude = NaN;
        this.longitude = NaN;
        this.altitude = NaN;
    }

    isValid(): boolean {
        if (!this.latitude || !this.longitude) {  // 有効値でピッタリ0は無いだろうから弾く
            return false;
        }

        return (Math.abs(this.latitude) <= 90 && Math.abs(this.longitude) <= 180);
    }

    fromDigreeMinute(coord: Coordinate_t) {
        this.latitude = this.DMtoDegree(coord.latitude);
        this.longitude = this.DMtoDegree(coord.longitude);
        if (coord.altitude) {
            this.altitude = coord.altitude;
        }
    }
}
