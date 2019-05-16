FROM python:3.7.3-slim-stretch
WORKDIR /app
COPY . .
SHELL ["/bin/bash", "-c"]
RUN pip install --upgrade pip && \
apt-get update && apt-get install -y curl gcc && \
curl -sSL https://raw.githubusercontent.com/sdispater/poetry/master/get-poetry.py | python
RUN source "$HOME/.poetry/env" && poetry install
EXPOSE 5890
ENTRYPOINT ["bash", "-c", "source $HOME/.poetry/env && poetry run start"]