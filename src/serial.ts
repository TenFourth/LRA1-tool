const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')

export class Serial {
    private parser = new Readline({ delimiter: '\r\n' });
    private listener = (data: string) => { };
    port: any = null;

    static boudRates: ReadonlyArray<number> = [
        110, 300, 1200, 2400, 4800, 9600, 14400, 19200, 38400, 57600, 115200, 128000, 230400, 256000, 460800, 512000, 9216000
    ];

    static list() {
        return new Promise((resolve, reject) => {
            SerialPort.list().then(ports => {
                if (ports.length === 0) {
                    reject('有効なシリアル通信ポートが見つかりません');
                }
                resolve(ports);
            }).catch(error => {
                reject(error.message);
            });
        });
    }

    connect(options) {
        return new Promise((resolve, reject) => {
            this.disconnect();
            this.port = new SerialPort(options.path, {
                baudRate: options.baudRate || 115200,
                autoOpen: options.autoOpen || false
            }, (error) => {
                reject(error.message);
            });
            this.port.pipe(this.parser);

            if (options.on) {
                this.listener = (data: string) => options.on(data);
                this.parser.on('data', this.listener);
            }
            resolve();
        });
    }

    disconnect() {
        if (this.port) {
            this.parser.removeListener('data', this.listener);
            this.port.close((error) => {
                console.info(error.message);
            });
        }
        this.port = null;
    }

    write(message) {
        if (!this.port) {
            throw new Error('シリアル通信のデバイスが切断しています');
        }
        this.port.write(message);
    }

    read() {
        return this.port.read();
    }
}
