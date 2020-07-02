module.exports = function (mainWindow) {
    const { app } = require('electron')

    return [{
        label: app.name,
        submenu: [
            {
                role: 'close',
                accelerator: 'Command+Q'
            }
        ]
        /*
            }, {
                label: 'View',
                submenu: [{
                    role: 'reload'
                }, {
                    label: 'DevTools',
                    accelerator: 'Alt+Command+I',
                    click: function () {
                        mainWindow.openDevTools();
                    }
                }]
        */
    }];
};
