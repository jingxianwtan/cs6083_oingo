function Note(text, user_id, lat, lon, timestamp, radius) {
  this.text = text;
  this.user_id = user_id;
  this.lat = lat;
  this.lon = lon;
  this.timestamp = timestamp;
  this.radius = radius;
}

Note.prototype.printItself = function printItself() {
  console.log(`hey this is user ${this.user_id} + ${this.text} + ${this.timestamp}`);
};

module.exports = Note;