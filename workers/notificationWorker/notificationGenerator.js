function notificationGenerator(obj) {
  let totalCount = 0;
  let body = '';

  const keys = Object.keys(obj);

  keys.forEach((key, index) => {
    totalCount += obj[key];

    if (keys.length - 1 === index) {
      body += `and ${key}(${obj[key]}).`;
    }
    if (keys.length - 2 === index) {
      body += `${key}(${obj[key]}) `;
    }
    if (keys.length - 1 !== index && keys.length - 2 !== index) {
      body += `${key}(${obj[key]}), `;
    }
  });

  const title = `${totalCount} New Notifications`;
  return { title, body, totalNewNotificationCount: totalCount };
}

module.exports = notificationGenerator;
