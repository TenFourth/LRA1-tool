const datetime = require('./datetime.js');
import { Coordinate } from './coordinate';
import { Waypoint } from '../@types/waypoint';

function properties(wp) {
    let icon = "https://maps.gsi.go.jp/portal/sys/v4/symbols/081.png";
    if (isNaN(wp.rssi) || wp.rssi < -137) {
        icon = "https://maps.gsi.go.jp/portal/sys/v4/symbols/092.png";
    } else if (wp.rssi < -120) {
        icon = "https://maps.gsi.go.jp/portal/sys/v4/symbols/080.png";
    } else if (wp.rssi < -100) {
        icon = "https://maps.gsi.go.jp/portal/sys/v4/symbols/082.png";
    }

    return {
        datetime: datetime.toUTCString(wp.datetime, false),
        latitude: wp.coordinate.latitude,
        longitude: wp.coordinate.longitude,
        speed: wp.speed,
        rssi: wp.rssi,
        data: wp.data,
        _markerType: "Icon",
        _iconUrl: icon,
        _iconSize: [20, 20],
        _iconAnchor: [10, 10]
    };
}

function makeFeature(wp: Waypoint) {
    return {
        type: "Feature",
        properties: properties(wp),
        geometry: {
            type: "Point",
            coordinates: [wp.coordinate.longitude, wp.coordinate.latitude]
        }
    };
}

export function GeoJson(waypoints: Array<Waypoint>): string {
    const features = new Array();
    for (const wp of waypoints) {
        const coordinate = new Coordinate(wp.coordinate);
        if (coordinate.isValid()) {
            features.push(makeFeature(wp));
        }
    }

    return JSON.stringify({
        type: "FeatureCollection",
        features: features
    });
};
