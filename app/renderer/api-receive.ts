// このコード内の window.api は pleload.js の
// contextBridge.exposeInMainWorld() の処理に渡っています

declare var api;  // window.api -> api
declare var renderer;

api.on("error", (message: string) => {
    renderer.onError(message);
});

api.on("serialList-reply", (ports) => {
    renderer.serialList = [];

    ports.forEach(p => {
        renderer.serialList.push({
            value: p.path,
            text: p.path + ' - ' + p.manufacturer + '(' + p.vendorId + ',' + p.productId + ')'
        });
    })

    renderer.onListRefresh();
});

api.on("baudrateList-reply", (baudrateList) => {
    renderer.baudrates = [];

    baudrateList.forEach(b => {
        renderer.baudrates.push({
            value: b,
            text: b
        })
    })

    renderer.onListRefresh();
});

api.on("openSavePathDialog-reply", (savePath) => {
    if (savePath) {
        renderer.selectedSavePath = savePath;
        renderer.onSetSavePath();
    }
});

api.on("gps-data-received", (data) => {
    document.getElementById('gps_out').textContent = data;
});

api.on("lora-data-received", (data) => {
    document.getElementById('lora_out').textContent = data;
});

api.on("lora-received", (data) => {
    document.getElementById('rssi').setAttribute('value', data.rssi ? data.rssi.toString() : '---');
    document.getElementById('received_data').setAttribute('value', data.received || data.error);
});

api.on('gps-received', (data) => {
    document.getElementById('latlng').setAttribute('value', 'lat: ' + data.latitude + ', lng: ' + data.longitude);
    document.getElementById('datetime').setAttribute('value', data.datetime);
});

api.on('logging-reply', (flag) => {
    const button = document.getElementById('buttonLogging');
    if (flag === true) {
        button.classList.remove('is-primary');
        button.classList.add('is-danger');
        button.innerText = 'ログ停止'
    } else {
        button.classList.remove('is-danger');
        button.classList.add('is-primary');
        button.innerText = 'ログ開始'
    }
});
