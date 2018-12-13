const Utils = require('./Utils');
const utils = new Utils();

function Schedule(currDate, startDate, endDate, startTime, endTime, frequency) {
  this.currDate = currDate;
  this.startDate = startDate;
  this.endDate = endDate;
  this.startTime = startTime;
  this.endTime = endTime;
  this.frequency = frequency;
}

Schedule.prototype.currDateTime = function getCurrDateTime() {
  return utils.getDateTimeString(this.currDate);
};

Schedule.prototype.getStartDate = function getStartDate() {
  if (!this.startDate) {
    const dayOfMonth = utils.prettyPrint(this.currDate.getDate());
    const month = utils.prettyPrint(this.currDate.getMonth() + 1);
    return `${this.currDate.getFullYear()}-${month}-${dayOfMonth}`;
  } else {
    return this.startDate;
  }
};

Schedule.prototype.getEndDate = function getEndDate() {
  if (!this.endDate) {
    return `9999-12-31`;
  } else {
    return this.endDate;
  }
};

Schedule.prototype.getStartTime = function getStartTime() {
  if (!this.startTime) {
    return `00:00`;
  } else {
    return this.startTime;
  }
};

Schedule.prototype.getEndTime = function getEndTime() {
  if (!this.endTime) {
    return `23:59`;
  } else {
    return this.endTime;
  }
};

Schedule.prototype.getFrequency = function getFrequency() {
  return this.frequency;
};


module.exports = Schedule;