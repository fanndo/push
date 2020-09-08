self.onpush = function (e) {
    var data = {};
    if (e.data) {
        data = e.data.json();
    }

    console.log(data, e.data);

    var options = {
        body: data.message,
        icon: 'images/example.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '2'
        },
        actions: [
            {
                action: 'explore', title: 'Explore this new world',
                icon: 'images/checkmark.png'
            },
            {
                action: 'close', title: 'Close',
                icon: 'images/xmark.png'
            },
        ]
    };
    e.waitUntil(
        self.registration.showNotification(data.title, options)
    );
};

self.onpushsubscriptionchange = function () {
    console.log('cambio subscripcion...');
};