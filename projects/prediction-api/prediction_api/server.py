from flask import Flask, request, make_response, jsonify, Response
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
  
  length = 128
  batch_size = 128

  number_of_values_to_remove = len(values) % batch_size
  number_of_values_to_keep = len(values) - number_of_values_to_remove
  values_cropped = values[-number_of_values_to_keep:]
  times_cropped = times[-number_of_values_to_keep:]

  scaler = MinMaxScaler(feature_range=(0, 1))
  scaled_values = scaler.fit_transform(values_cropped.reshape(-1, 1))

  predicted_values = model.predict(scaled_values.reshape(batch_size, len(scaled_values) // batch_size, 1), batch_size=batch_size)

  hour_in_seconds = 3600
  start_predicted_time = times_cropped[-1]
  end_predicted_time = (hour_in_seconds * len(predicted_values)) + start_predicted_time
  predicted_times = [time for time in range(start_predicted_time, end_predicted_time, hour_in_seconds)]
  future_predicted_values = predicted_values[-(steps_in_future * batch_size):]
  future_predicted_times = predicted_times[-(steps_in_future * batch_size) :]
  
  rescaled_predicted_values = scaler.inverse_transform(predicted_values)

  response_body = {
    'predictions': []
  }

  for i in range(0, len(predicted_times)):
    response_body['predictions'].append({
      'timestamp': int(predicted_times[i]),
      'value': float(rescaled_predicted_values[i][0]),
    })

  response = jsonify(response_body)
  response.headers['Access-Control-Allow-Origin'] = '*'

  return response