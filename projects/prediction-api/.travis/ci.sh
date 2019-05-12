poetry install
poetry run create_model
poetry run pytest

serverpid=$BASHPID
poetry run start & dredd
kill $serverpid