function State(stateRow) { //name, tagsStr, keywordsStr, postBy
  this.stateRow = stateRow;
}

State.prototype.getName = function getName() {
  if (this.stateRow == null || this.stateRow.name == null) {
    return "default";
  } else {
    return this.stateRow.name;
  }
};

State.prototype.getTags = function getTags() {
  if (this.stateRow == null || this.stateRow.tags == null || !this.stateRow.tags.length) {
    return [];
  } else {
    return this.stateRow.tags.split(";").map(tag => tag.trim());
  }
};

State.prototype.getKeywords = function getKeywords() {
  if (this.stateRow == null || this.stateRow.keywords == null || !this.stateRow.keywords.length) {
    return [];
  } else {
    return this.stateRow.keywords.split(";").map(keyword => keyword.trim());
  }
};

State.prototype.getWithinRadius = function getWithinRadius() {
  if (this.stateRow == null || this.stateRow.within_radius == null) {
    return -1;
  } else {
    return this.stateRow.within_radius;
  }
};

State.prototype.getPostBy = function getPostBy() {
  if (this.stateRow == null) {
    return "everyone";
  } else {
    return this.stateRow.post_by;
  }
};

module.exports = State;