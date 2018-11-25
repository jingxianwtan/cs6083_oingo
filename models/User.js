function User(user_id, username, password) {
  this.user_id = user_id;
  this.username = username;
  this.password = password;
}

User.prototype.printItself = function printItself() {
  console.log(`hey this is user ${this.user_id} + ${this.username} + ${this.password}`);
};

module.exports = User;