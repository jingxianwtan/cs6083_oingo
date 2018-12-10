# cs6083_oingo


//TODO:
* mobile web compatible
* Error handling


//Done:
* User can set his/her own curr location (to replace auto-update), default curr_loc is {lat: 40.7539278, lon: -73.9865007}
* List, add, edit, delete note
* Visibility (friends, me)
* Check distance within radius when querying from MySQL
* Check date to match note frequency
* States filters (tags, keywords, radius, postBy)
* Tag extraction & updating when adding/editing notes
* Friend & un-friend
* Check 10 max for state tag/keywords filter
* Check frequency = one-time
* Reply to
* If the post is my own, do I need to check distance? --- My notes: no. All notes on home page: yes
* No console.logs showing around

//Bug:
* All console.log(err) needs to show error (e.g. for SQL)
* Add friend needs the other guys' confirmation???
