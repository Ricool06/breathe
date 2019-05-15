from flask import Flask, request, make_response, jsonify
import requests
import numpy
from dateutil.parser import parse as parse_date
from datetime import datetime, timedelta
# from keras.preprocessing.sequence import TimeseriesGenerator
# from keras import Sequential
# from keras.layers import LSTM, Dense, Activation, CuDNNLSTM
# from keras.models import load_model
import keras
from matplotlib import pyplot
# from keras import backend as K
# from keras.callbacks import TerminateOnNaN, LambdaCallback
from sklearn.preprocessing import MinMaxScaler, StandardScaler
from prediction_api.ml_model.create_model import fetch_test_data, smooth_values, construct_untrained_model
# from keras.optimizers import SGD, RMSprop


app = Flask(__name__)

@app.route('/message')
def message():
    return 'Hello, World!\n'

@app.route('/predict')
def predict():
  from .model_loader import model

  latitude = request.args.get('latitude', type=str)
  longitude = request.args.get('longitude', type=str)
  parameter = request.args.get('parameter', type=str)
  look_back = request.args.get('lookback', type=int)

  times, values = fetch_test_data(parameter, latitude, longitude)
  values = values[24:-24]
  times = times[24:-24]

  expected_times = times[-128:]
  expected_values = values[-128:]
  times = times[:-128]
  values = values[:-128]
  
  length = 128
  batch_size = 128

  number_of_values_to_remove = len(values) % batch_size
  number_of_values_to_keep = len(values) - number_of_values_to_remove
  values_cropped = values[-number_of_values_to_keep:]
  times_cropped = times[-number_of_values_to_keep:]

  scaler = StandardScaler()
  scaled_values = scaler.fit_transform(values_cropped.reshape(-1, 1))

  # timeseries_gen = keras.preprocessing.sequence.TimeseriesGenerator(
  #   scaled_values,
  #   scaled_values,
  #   length=length,
  #   batch_size=batch_size,
  #   sampling_rate=1,
  # )

  # print(timeseries_gen.__getitem__(0))
  
  steps_in_future = 1
  total_steps_to_predict = (len(values_cropped) / batch_size) - (steps_in_future - 1)

  # predicted_values = model.predict_generator(timeseries_gen, steps=1)
  # scaled_values = scaled_values #DELETE FATER
  predicted_values = model.predict(scaled_values.reshape(batch_size, len(scaled_values) // batch_size, 1), batch_size=batch_size)
  print(predicted_values)

  hour_in_seconds = 3600
  start_predicted_time = times_cropped[-1]
  end_predicted_time = (hour_in_seconds * len(predicted_values)) + start_predicted_time
  predicted_times = [time for time in range(start_predicted_time, end_predicted_time, hour_in_seconds)]
  future_predicted_values = predicted_values[-(steps_in_future * batch_size):]
  future_predicted_times = predicted_times[-(steps_in_future * batch_size):]

  pyplot.plot(times_cropped, scaler.inverse_transform(scaled_values))
  pyplot.plot(predicted_times, scaler.inverse_transform(predicted_values))
  pyplot.plot(expected_times, expected_values)
  # pyplot.plot(future_predicted_times, scaler.inverse_transform(future_predicted_values))
  pyplot.show()

  return jsonify({
    'predictions': [
      {
        'timestamp': 1,
        'value': 0
      }
    ]
  })