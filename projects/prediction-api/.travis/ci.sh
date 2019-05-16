poetry install
poetry run pytest

poetry run start & sleep 8 && poetry run pact-verifier --provider-base-url=http://localhost:5890 ../web-ui/pacts
