const Service = require('node-windows').Service;

const svc = new Service({
    name: 'Wedding API',
    description: 'Wedding Site API Server',
    script: 'D:\\Nginx\\nginx-1.27.4\\Wedding\\server.js',
    workingDirectory: 'D:\\Nginx\\nginx-1.27.4\\Wedding',
    nodeOptions: [],
    env: [{
        name: "NODE_ENV",
        value: "production"
    }]
});

svc.on('install', function() {
    svc.start();
    console.log('Service installed successfully');
});

svc.on('error', function(error) {
    console.error('Service error:', error);
});

svc.uninstall();