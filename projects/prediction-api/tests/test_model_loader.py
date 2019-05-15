from unittest.mock import MagicMock
import pytest
import keras

def test_load_model(monkeypatch):
  mock_model = 'mock model value'
  mock_load_model = MagicMock(return_value=mock_model)
  monkeypatch.setattr(keras.models, 'load_model', mock_load_model)
  
  from prediction_api.model_loader import model
  mock_load_model.assert_called_once()

  assert model == mock_model
