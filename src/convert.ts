import fs from 'fs';
import { dialog } from 'electron';
import { Waypoint } from '../@types/waypoint';
import { CsvParser } from './csv-parser';
import { GeoJson } from './geojson';

const GEOJSON_EXTENSION = 'geojson';

function modifyExtension(path: string, extension: string): string {
    const i = path.lastIndexOf('.');
    const filename = (0 <= i) ? path.substring(0, i) : path;
    return filename + '.' + extension;
}

export class Convert {
    private static load(filepath: string): Array<Waypoint> {
        const csvParser = new CsvParser(filepath);
        const data = fs.readFileSync(filepath, { encoding: 'utf8' });

        return csvParser.getWaypoints(data);
    }

    static toGeoJson(filepath: string) {
        const waypoints = this.load(filepath);
        const geojson = GeoJson(waypoints);

        dialog.showSaveDialog(
            {
                defaultPath: modifyExtension(filepath, GEOJSON_EXTENSION),
                filters: [
                    { name: 'GeoJSON', extensions: [GEOJSON_EXTENSION] },
                    { name: 'All Files', extensions: ['*'] }
                ],
                properties: [
                    'createDirectory',
                    'showOverwriteConfirmation'
                ]
            }
        ).then(result => {
            if (result.filePath) {  // cancel 時は undefined になる
                console.log(result.filePath);
                fs.writeFile(result.filePath, geojson, (error) => {
                    if (error) throw error;
                });
            }
        });
    }
}
