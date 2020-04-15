importScripts('idb.js');

const thingsToCache = [
  'index.html',
  'idb.js',
  'static/js/1.2a4c83c9.chunk.js',
  'static/js/main.323cc917.chunk.js',
  'static/js/runtime~main.229c360f.js',
  'static/css/main.59976c14.chunk.css',
  'static/media/roboto.18d44f79.ttf',
  'static/media/comfortaa.7d0400b7.ttf',
];

async function dbReader(refToDB, objectStore, id) {
  try {
    const db = await refToDB;
    const tx = db.transaction(objectStore, 'readwrite');

    let data;

    //tslint:disable

    if (id) {
      data = await tx.objectStore(objectStore).get(id);
    } else {
      data = await tx.objectStore(objectStore).getAll();
    }

    console.log(data);
    return data;
  } catch (err) {
    console.log(err);
  }
  return null;
}

this.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll(thingsToCache);
    })
  );
});

this.addEventListener('activate', async (event) => {
  event.waitUntil(
    caches
      .open('v1')
      .then((cache) => {
        this.idb
          .openDB(`TubeDB`, 1, {
            upgrade(db, oldVerNum, newVerNum, tx) {
              console.log(db, oldVerNum, newVerNum, tx);
              if (!db.objectStoreNames.contains(`subscription`)) {
                db.createObjectStore(`subscription`, {
                  keyPath: `channelTag`,
                });
              }
              if (!db.objectStoreNames.contains(`general`)) {
                db.createObjectStore(`general`, { keyPath: 'id', autoIncrement: true });
              }
              if (!db.objectStoreNames.contains(`last-updated`)) {
                db.createObjectStore(`last-updated`, { keyPath: 'channelTag' });
              }
              if (!db.objectStoreNames.contains(`query`)) {
                db.createObjectStore(`query`, { keyPath: 'channelTag' });
              }
              if (!db.objectStoreNames.contains(`cache-history`)) {
                db.createObjectStore(`cache-history`, {
                  keyPath: 'id',
                  autoIncrement: true,
                });
              }
              if (!db.objectStoreNames.contains(`cache-keep`)) {
                db.createObjectStore(`cache-keep`, {
                  keyPath: 'id',
                  autoIncrement: true,
                });
              }
              if (!db.objectStoreNames.contains('setting')) {
                db.createObjectStore('setting', {
                  keyPath: 'id',
                  autoIncrement: true,
                });
              }
            },
          })
          .then((db) => {
            dbReader(db, 'cache-delete', 1).then((cachesToKeepObj) => {
              cache.keys().then((requestsArr) => {
                requestsArr.forEach((requestObj) => {
                  if (cachesToKeepObj) {
                    console.log('Executing block #1');
                    let deleteThis = true;

                    const urlParts = requestObj.url.split('/');
                    thingsToCache.forEach((val) => {
                      const pathParts = val.split('/');
                      if (urlParts[urlParts.length - 1] === pathParts[pathParts.length - 1]) {
                        deleteThis = false;
                      }
                    });

                    cachesToKeepObj.data.forEach((link) => {
                      if (link === requestObj.url) {
                        deleteThis = false;
                      }
                    });

                    if (deleteThis) {
                      cache.delete(requestObj);
                    }
                  } else {
                    let deleteThis = true;
                    const urlParts = requestObj.url.split('/');
                    thingsToCache.forEach((val) => {
                      const pathParts = val.split('/');
                      if (urlParts[urlParts.length - 1] === pathParts[pathParts.length - 1]) {
                        console.log('saved');
                        deleteThis = false;
                      }
                    });

                    if (deleteThis) {
                      cache.delete(requestObj);
                    }
                  }
                });
              });
            });
          });
      })
      .catch((err) => {
        console.log(err);
      })
  );
});

this.addEventListener('fetch', (event) => {
  //respond to fetch requests here

  event.respondWith(
    caches
      .match(event.request)
      .then((cachedRes) => {
        if (cachedRes) {
          console.log('Match found for: ', event.request.url);

          return cachedRes;
        } else {
          console.log('Match not found for: ', event.request.url);

          throw new Error('No match found in cache!');
        }
      })
      .catch(() => {
        if (event.request.method === 'GET' && event.request.headers.get('accept').includes('text/html')) {
          const urlParts = event.request.url.split('/');

          if (urlParts[urlParts.length - 1] === '') {
            console.log('Cache hit for HTML: ', event.request);
            return caches.match('index.html');
          }
        }

        console.log(event.request);

        if (event.request.url.endsWith('.jpg')) {
          fetch(event.request)
            .then((res) => {
              const clone = res.clone();

              caches
                .open('v1')
                .then((cache) => {
                  cache.put(event.request, res);
                  return clone;
                })
                .catch(() => {
                  return clone;
                });
            })
            .catch(() => fetch(event.request));
        }

        if (
          event.request.destination === 'image' &&
          !event.request.url.endsWith('.jpg') &&
          !event.request.url.endsWith('.ico') &&
          !event.request.url.endsWith('192.png')
        ) {
          fetch(event.request)
            .then((res) => {
              const clone = res.clone();

              caches
                .open('v1')
                .then((cache) => {
                  cache.put(event.request, res);
                  return clone;
                })
                .catch(() => {
                  return clone;
                });
            })
            .catch(() => fetch(event.request));
        }

        return fetch(event.request);
      })
  );
});

this.addEventListener('push', (e) => {
  if (!Notification || Notification.permission !== 'granted') {
    console.log('Notification not available or permission not granted...');

    return;
  }

  const data = e.data.json();
  console.log(data);

  console.log('Push Recieved...');
  this.registration.showNotification(data.title, {
    body: data.body,
    icon: '512.png',
    vibrate: [200, 100, 200, 100, 200, 100, 200],
  });
});
