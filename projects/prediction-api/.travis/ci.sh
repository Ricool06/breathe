serverpid=$BASHPID
poetry run start & dredd
kill $serverpid