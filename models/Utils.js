module.exports = function Utils() {
  this.getTagsFromText = function getTagsFromText(text) {
    const tagRegex = /(^|)#([\w]+)/gm;

    let matches = [];
    let match;
    while (match = tagRegex.exec(text)) {
      matches.push(match[2]);
    }
    return matches;
  };

  this.textWithClickableTags = function replaceHashTagsInText(text) {
    const hashtagRegex = /(^|)#([\w]+)/gm;
    return text.replace(hashtagRegex, `$1<a href='/notes?tag=$2'>#$2</a>`)
  };

  this.clickableUserName = function replaceUsername(username) {
    return `<a href='/notes/all/users/${username}/'>@${username}</a>`
  };

  this.getDateString = function getDateStringFromDateTime(datetime) {
    if (!datetime) {
      return "";
    } else {
      const month = this.prettyPrint(datetime.getMonth() + 1);
      const date = this.prettyPrint(datetime.getDate());
      return `${datetime.getFullYear()}-${month}-${date}`;
    }
  };

  this.getDateTimeString = function getDateTimeStringFromDateTime(datetime) {
    if (!datetime) {
      return "";
    } else {
      const month = this.prettyPrint(datetime.getMonth() + 1);
      const dayOfMonth = this.prettyPrint(datetime.getDate());
      const hours = this.prettyPrint(datetime.getHours());
      const minutes = this.prettyPrint(datetime.getMinutes());
      const seconds = this.prettyPrint(datetime.getSeconds());
      return `${datetime.getFullYear()}-${month}-${dayOfMonth} ${hours}:${minutes}:${seconds}`;
    }
  };

  this.prettyPrint = function pretty(number) {
    if (number < 10) {
      return `0${number}`;
    } else {
      return `${number}`;
    }
  };

  this.getNonNullAttributes = function nonNullAttributes(attributes) {
    let nonNull = {};
    for (let key in attributes) {
      if (attributes.hasOwnProperty(key) && attributes[key] !== '') {
        nonNull[key] = attributes[key];
      }
    }
    return nonNull;
  };

  this.getTimeOfDay = function getTimeOfDay(datetime) {
    const hours = this.prettyPrint(datetime.getHours());
    const minutes = this.prettyPrint(datetime.getMinutes());
    const seconds = this.prettyPrint(datetime.getSeconds());

    return `${hours}:${minutes}:${seconds}`;
  };

  this.setUserTimeAndLocation = function setUserTimeAndLocation(mysql_conn, user, currTime, currLat, currLon) {
    const checkCurrLocTimeQuery = `select * from user_locations where user_id = '${user.user_id}';`;
    const insertCurrLocQuery = `insert user_locations (user_id, curr_Time, curr_lat, curr_lon) values
                              ('${user.user_id}', '${currTime}', ${currLat}, ${currLon});`;
    const updateCurrLocQuery = `update user_locations set 
                              curr_time = '${currTime}', curr_lat = ${currLat}, curr_lon = ${currLon}
                              where user_id = '${user.user_id}';`;
    mysql_conn.query(checkCurrLocTimeQuery, function(err, rows) {
      if (err) console.log(err);

      if (rows.length) {
        mysql_conn.query(updateCurrLocQuery, function (err) {
          if (err) console.log(err);
        });
      } else {
        mysql_conn.query(insertCurrLocQuery, function (err) {
          if (err) console.log(err);
        });
      }
    });
  }
};