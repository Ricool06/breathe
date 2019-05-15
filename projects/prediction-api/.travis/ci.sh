poetry install
poetry run pytest

serverpid=$BASHPID
poetry run start & dredd
kill $serverpid