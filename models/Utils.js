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
      const dt = new Date(datetime);
      const month = this.prettyPrint(dt.getMonth() + 1);
      const date = this.prettyPrint(dt.getDate());
      return `${dt.getFullYear()}-${month}-${date}`;
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
};