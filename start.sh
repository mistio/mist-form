# !/bin/bash

# start the server and send the console and error logs on nodeserver.log
npm run start > nodeserver.log 2>&1 &

exit 0
