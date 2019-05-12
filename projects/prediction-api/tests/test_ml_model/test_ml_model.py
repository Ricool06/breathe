import pytest
import unittest
import requests
from datetime import datetime, timedelta
from dateutil.parser import parse as parse_date
import numpy
from matplotlib import pyplot
from keras.models import load_model
from keras.preprocessing.sequence import TimeseriesGenerator
from sklearn.preprocessing import StandardScaler
from prediction_api.ml_model.create_model import fetch_test_data

class TestMlModel(unittest.TestCase):
  def test_accuracy(self):
    times, values = fetch_test_data('pm10', '40.0844', '113.2711')

    eval_length = 128
    eval_batch_size = 128

    number_of_values_to_remove = len(values) % eval_batch_size
    number_of_values_to_keep = len(values) - number_of_values_to_remove
    values_cropped = values[-number_of_values_to_keep:]

    scaler = StandardScaler()
    scaled_values = scaler.fit_transform(values_cropped.reshape(-1, 1))

    timeseries_gen = TimeseriesGenerator(
      scaled_values,
      scaled_values,
      length=eval_length,
      batch_size=eval_batch_size,
      sampling_rate=1
    )

    model = load_model('pollution_forecast_model.h5')
    loss = model.evaluate_generator(timeseries_gen)

    self.assertLessEqual(loss, 0.01)
