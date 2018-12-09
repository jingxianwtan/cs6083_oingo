const Utils = require('./Utils');
const utils = new Utils();

module.exports = function Schedule(currDate, startDate, endDate, startTime, endTime, frequency) {
  this.currDateTime = function getCurrDateTime() {
    return utils.getDateTimeString(currDate);
  };

  this.startDate = function getStartDate() {
    if (!startDate || startDate.isBefore(currDate)) {
      const dayOfMonth = utils.prettyPrint(currDate.getDate());
      const month = utils.prettyPrint(currDate.getMonth() + 1);
      return `${currDate.getFullYear()}-${month}-${dayOfMonth}`;
    } else {
      return startDate;
    }
  };

  this.endDate = function getEndDate() {
    if (!endDate || endDate.isBefore(currDate)) {
      return `9999-12-31`;
    } else {
      return endDate;
    }
  };

  this.startTime = function getStartTime() {
    if (!startTime) {
      return `00:00`;
    } else {
      return startTime;
    }
  };

  this.endTime = function getEndTime() {
    if (!endTime) {
      return `23:59`;
    } else {
      return endTime;
    }
  };

  this.frequency = function getFrequency() {
    return frequency;
  }
};


// { text: 'This is a note of #food2',
//   radius: '100',
//   visibility: 'friends',
//   start_date: '2018-08-31',
//   end_date: '2018-12-31',
//   start_time: '00:00',
//   end_time: '23:59' }