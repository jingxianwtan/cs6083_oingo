DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `user_id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(45) NOT NULL,
  `password` VARCHAR(256) NOT NULL,
  PRIMARY KEY (`user_id`));

DROP TABLE IF EXISTS `notes`;
CREATE TABLE `notes` (
  `note_id` VARCHAR(60) NOT NULL,
  `reply_to` VARCHAR(60),
  `user_id` INT NOT NULL,
  `text` VARCHAR(600) NOT NULL,
  `lat` DOUBLE(10, 7) NOT NULL,
  `lon` DOUBLE(10, 7) NOT NULL,
  `timestamp` DATETIME NOT NULL,
  `radius` DOUBLE(10, 2),
  `visibility` VARCHAR(30) NOT NULL,
  PRIMARY KEY (`note_id`));

DROP TABLE IF EXISTS `friendships`;
CREATE TABLE `friendships` (
`user_id` INT NOT NULL,
`friend_id` INT NOT NULL,
PRIMARY KEY (`user_id`,`friend_id`));

DROP TABLE IF EXISTS `tags`;
CREATE TABLE `tags` (
`tag` VARCHAR(45) NOT NULL,
`note_id` VARCHAR(60) NOT NULL,
PRIMARY KEY (`tag`, `note_id`));

DROP TABLE IF EXISTS `user_locations`;
CREATE TABLE `user_locations` (
`user_id` INT NOT NULL,
`curr_time` DATETIME NOT NULL,
`curr_lat` FLOAT NOT NULL,
`curr_lon` FLOAT NOT NULL,
PRIMARY KEY (`user_id`));

DROP TABLE IF EXISTS `schedules`;
CREATE TABLE `schedules` (
`schedule_id` INT NOT NULL auto_increment,
`note_id` VARCHAR(60) NOT NULL,
`start_time` TIME,
`end_time` TIME,
`start_date` DATE,
`end_date` DATE,
`frequency` VARCHAR(20) NOT NULL,
PRIMARY KEY (`note_id`));

DROP TABLE IF EXISTS `states`;
CREATE TABLE `states` (
`state_id` VARCHAR(60) NOT NULL,
`user_id` INT NOT NULL,
`name` VARCHAR(45) NOT NULL,
`tags` VARCHAR(200),
`keywords` VARCHAR(200),
`within_radius` DOUBLE(10, 2),
`post_by` VARCHAR(20) NOT NULL,
PRIMARY KEY (`user_id`, `name`));
