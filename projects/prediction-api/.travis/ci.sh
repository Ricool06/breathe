curl -sSL https://raw.githubusercontent.com/sdispater/poetry/master/get-poetry.py | python
source $HOME/.poetry/env

poetry install
poetry run pytest

poetry run start & sleep 8 && poetry run pact-verifier --provider-base-url=http://localhost:5890 ../web-ui/pacts
