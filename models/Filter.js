module.exports = function Filter(tags, keywords, withinRadius, postBy, user) {
  this.getTagQuery = function getTagQuery() {
    if (tags.length) {
      console.log(tags.map(tag => `'#' + notes_filtered.text + '#' like '%[^a-zA-Z0-9]#${tag}[^a-zA-Z0-9]%'`).join(" and "));
      return tags.map(tag => `notes_filtered.text like '% #${tag}%'`).join(" and ");
    } else {
      return "";
    }
  };

  this.getKeywordsQuery = function getKeywordsQuery() {
    if (keywords.length) {
      console.log(keywords.map(keyword => `'#' + notes_filtered.text + '#' like '%[^a-zA-Z0-9]${keyword}[^a-zA-Z0-9]%'`).join(" and "));
      return keywords.map(keyword => `notes_filtered.text like '%${keyword}%'`).join(" and ");
    } else {
      return "";
    }
  };

  this.getWithinRadiusQuery = function getWithinRadiusQuery() {
    if (withinRadius === -1) {
      return "";
    } else {
      return `notes_filtered.dist_in_mile < ${withinRadius}`;
    }
  };

  this.getPostByQuery = function getPostByQuery() {
    console.log(postBy);
    if (postBy === "everyone") {
      return "";
    } else if (postBy === "friends") {
      return `notes_filtered.user_id in (select friend_id from friendships where user_id = ${user.user_id})`;
    } else { // (getPostBy === "me")
      return `notes_filtered.user_id = ${user.user_id}`;
    }
  };

  this.getFiltersQuery = function getStateFilterQuery() {
    const filters = [this.getTagQuery(), this.getKeywordsQuery(), this.getWithinRadiusQuery(), this.getPostByQuery()]
                    .filter(query => query.length);

    if (filters.length) {
      return `\nwhere (${filters.join(") and (")})`;
    } else {
      return "";
    }
  }
};