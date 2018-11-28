module.exports = function StringUtil() {
  this.textWithClickableTags = function replaceHashTagsInText(text) {
    const hashtagRegex = /(^|)#([\w]+)/gm;
    return text.replace(hashtagRegex, `$1<a href='/tags/$2/'>#$2</a>`)
  };
};