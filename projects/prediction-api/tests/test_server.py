from unittest.mock import Mock, MagicMock, patch
import unittest
import pytest
import json
import sys
import keras
import vcr
from sklearn.preprocessing import StandardScaler
import numpy

sys.modules['prediction_api.model_loader'] = MagicMock()
from prediction_api.model_loader import model as mock_model
from prediction_api.server import app

caught_response_dict = dict()
def catch_response(store_response_in):
  def before_record_response(response):
    store_response_in['response'] = response
    return response
  return before_record_response

custom_vcr = vcr.VCR(
    cassette_library_dir='fixtures/vcr_cassettes',
    match_on=['method', 'scheme', 'host', 'port', 'path'],
    before_record_response=catch_response(caught_response_dict)
)

@pytest.fixture
def client():
  app.config['TESTING'] = True
  client = app.test_client()
  yield client

@custom_vcr.use_cassette('fixtures/vcr_cassettes/measurements.yaml')
def test_predict(client, monkeypatch):
  query = {
    'parameter': 'pm10',
    'latitude': '40.0844',
    'longitude': '113.2711'
  }

  mock_model.predict.return_value = numpy.array([[0.2]])
  response = client.get('/predict', query_string=query)

  mock_model.predict.assert_called_once()

  body = json.loads(response.data)

  assert body["predictions"][0]['timestamp'] == 1557874800 # Value in VCR fixture
  assert isinstance(body["predictions"][0]['value'], float)
