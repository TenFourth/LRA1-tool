import { Coordinate } from './coordinate';
import { Dop } from './dop';
import { Xyz } from './xyz';

export interface Waypoint {
    datetime: number,  // UTCのミリ秒
    coordinate: Coordinate,
    variation?: number,
    speed?: number,
    gsensor?: Xyz,
    tripId?: string,   // NMEA内の識別子や、圧縮ファイルに含まれるファイル名など
    events?: Array<unknown>,
    dop?: Dop
}
