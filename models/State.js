module.exports = function State(stateRow) { //name, tagsStr, keywordsStr, postBy
  console.log(stateRow);
  this.getName = function getName() {
    if (stateRow == null || stateRow.name == null) {
      return "default";
    } else {
      return stateRow.name;
    }
  };

  this.getTags = function getTags() {
    if (stateRow == null || stateRow.tags == null || !stateRow.tags.length) {
      return [];
    } else {
      return stateRow.tags.split(";").map(tag => tag.trim());
    }
  };

  this.getKeywords = function getKeywords() {
    if (stateRow == null || stateRow.keywords == null || !stateRow.keywords.length) {
      return [];
    } else {
      return stateRow.keywords.split(";").map(keyword => keyword.trim());
    }
  };

  this.getWithinRadius = function getWithinRadius() {
    if (stateRow == null || stateRow.within_radius == null) {
      return -1;
    } else {
      return stateRow.within_radius;
    }
  };

  this.getPostBy = function getPostBy() {
    if (stateRow == null) {
      return "everyone";
    } else {
      return stateRow.post_by;
    }
  };
};