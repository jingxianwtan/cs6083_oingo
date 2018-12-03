module.exports = function Schedule(startDate, endDate, startTime, endTime, frequency) {
  const currDate = new Date();

  this.startDate = function getStartDate() {
    if (!startDate || startDate.isBefore(currDate)) {
      const dayOfMonth = prettyPrint(currDate.getDate());
      const month = prettyPrint(currDate.getMonth() + 1);
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
      const hour = prettyPrint(currDate.getHours());
      const minute = prettyPrint(currDate.getMinutes());
      return `${hour}:${minute}`
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

  this.frequency = frequency;
};

function prettyPrint(number) {
  if (number < 10) {
    return `0${number}`;
  } else {
    return `${number}`;
  }
}

// { text: 'This is a note of #food2',
//   radius: '100',
//   visibility: 'friends',
//   start_date: '2018-08-31',
//   end_date: '2018-12-31',
//   start_time: '00:00',
//   end_time: '23:59' }