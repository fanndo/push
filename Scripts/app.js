var deferredPrompt;
var networkDataReceived = false;
var url = ""; // EJEMPLO DE APLICACION DE CACHE THEN NETWORK
var isSubscribed = false,
    swRegistration = null,
    appKey = '';
async function updateSubscriptionOnServer(subscription) {
    var msg = new FormData();
    msg.append("sub", JSON.stringify(subscription));
    const sub = await fetch('/Notifications/Subscription', { method: "POST", body: msg });
    const data = await sub.json();
    console.log('al server..', sub, data);
}

function urlB64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);
    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
function base64Encode(arrayBuffer) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(arrayBuffer)));
}

function subscribe() {
    if (!isSubscribed) {
        navigator.serviceWorker.ready.then(function (reg) {
            var subscribeParams = { userVisibleOnly: true };
            var applicationServerKey = urlB64ToUint8Array(appKey);
            subscribeParams.applicationServerKey = applicationServerKey;
            console.log('ready..regggg', reg, subscribeParams)
            reg.pushManager.subscribe(subscribeParams)
                .then(function (subscription) {
                    debugger;
                    isSubscribed = true;
                    console.log('bien...', subscription);
                    updateSubscriptionOnServer(subscription)
                })
                .catch(function (e) {
                    console.error('[subscribe] Unable to subscribe to push', e);
                });
        })
            .catch(function (err) {
                console.log('[req.ready] Unable to get STATUS SW.', err);
            });
    }
}

(function () {
    if ('serviceWorker' in navigator) {
        console.log("app aqui si regsw edet");
        navigator.serviceWorker
            .register('sw.js')
            .then(function () { console.log('Service Worker Registered'); })
            .catch(function (err) { console.log('error install sw', err) });
    }
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        console.log('Service Worker and Push is supported');
        Notification.requestPermission().then(function (status) {
            if (status === 'denied') {
                console.log('[Notification.requestPermission] Browser denied permissions to notification api.');
            } else if (status === 'granted') {
                console.log('[Notification.requestPermission] Initializing service worker.');
                //var url = reg.scope;
                navigator.serviceWorker.ready.then(function (reg) {
                    console.log('registro', reg);
                    // Do we already have a push message subscription?
                    reg.pushManager.getSubscription()
                        .then(function (subscription) {
                            isSubscribed = subscription === null || typeof subscription === 'undefined' ? false : true;
                            console.log('isSubscribed', isSubscribed);
                            if (isSubscribed) {
                                console.log('enviar al server', subscription)
                                updateSubscriptionOnServer(subscription);
                              //TODO: update subscription
                            } else {
                                fetch(url + 'Notifications/GetAppKey', { method: "POST" })
                                    .then(res => res.ok ? res.json() : Promise.reject(res))
                                    .then(data => {
                                        appKey = data
                                        subscribe();
                                    })
                                    .catch(err => console.log(err));
                            }
                        })
                        .catch(function (err) {
                            console.log('[req.pushManager.getSubscription] Unable to get subscription details.', err);
                        });
                });

            }
        })
            .catch(function (err) {
                console.log('[Notification.requestPermission]', err);
            })
    } else {
        console.warn('Push messaging is not supported');
    }

})()