from flask import Flask
from flask import request
from flask import jsonify
import requests
import numpy
from dateutil.parser import parse as parse_date
from datetime import datetime, timedelta
from keras.preprocessing.sequence import TimeseriesGenerator
from keras import Sequential
from keras.layers import LSTM, Dense, Activation, CuDNNLSTM
from matplotlib import pyplot
from keras import backend as K
from keras.callbacks import TerminateOnNaN, LambdaCallback
from sklearn.preprocessing import MinMaxScaler, StandardScaler
from keras.optimizers import SGD, RMSprop
import os
os.environ["CUDA_VISIBLE_DEVICES"]="-1"

app = Flask(__name__)

@app.route('/message')
def message():
    return 'Hello, World!\n'

@app.route('/predict')
def predict():
  latitude = request.args.get('latitude', type=str)
  longitude = request.args.get('longitude', type=str)

  page = 1
  should_get_next_page = True
  results = []
  now = datetime.utcnow()

  while should_get_next_page:
    response = requests.get(
      'https://api.openaq.org/v1/measurements',
      params={
        'coordinates': latitude + ',' + longitude,
        'limit': 10000,
        'page': page,
        'radius': 100,
        'date_from': now.isoformat(),
        'date_from': (now - timedelta(days=90)).isoformat()
      }
    ).json()

    should_get_next_page = len(response["results"]) > 0
    page += 1
    results.extend(response["results"])

  # print(len(results))
  pollutant_history = format_results(results)
  pollutants = pollutant_history.keys()

  co_history = pollutant_history["pm10"]
  series = numpy.array(co_history)
  sorted = series[series[:, 0].argsort()] # sort by time column (the first column)

  measurements_only = sorted[:, 1:]  # leave only 2nd column onwards (remove time column)
  measurements_only = measurements_only[-1024:]
  running_mean_N = 24
  running_meaned_measurements = numpy.pad(running_mean(measurements_only, running_mean_N), (running_mean_N // 2, running_mean_N // 2), 'edge')

  # pyplot.plot(measurements_only)
  # pyplot.plot(running_meaned_measurements)
  # pyplot.show()

  scaler = StandardScaler()
  training_measurements = scaler.fit_transform(running_meaned_measurements.reshape(-1, 1))

  print('Training measures')
  print(training_measurements.shape)

  print('Just measures')
  print(measurements_only.shape)

  batch_size = 32
  training_batch_size = 32
  training_length = 128

  # Predict 168 measurements from the previous 504
  # Assuming no gaps in data, this equates to predicting the next week from 3 weeks of data
  timeseries_gen = TimeseriesGenerator(
    training_measurements,
    training_measurements,
    length=training_length,
    batch_size=training_batch_size,
    sampling_rate=1
  )

  # for i in range(len(timeseries_gen)):
  #   x, y = timeseries_gen[i]
  #   print('%s => %s' % (x, y))
  training_model = get_model_copy(training_batch_size, True)

  history = training_model.fit_generator(
    timeseries_gen,
    epochs=500,
    # callbacks=[LambdaCallback(on_epoch_end=lambda epoch, logs: training_model.reset_states())],
    shuffle=False
  )

  # pyplot.plot(history.history['loss'])
  # pyplot.ylabel('loss')
  # pyplot.xlabel('epoch')

  ## PREDICT
  predict_batch_size = 512

  model = get_model_copy(predict_batch_size, True)
  model.set_weights(training_model.get_weights())

  predictable = training_measurements[:512]
  #print(predictable)
  # predictable = predictable.reshape(16, 512 // 16, 1)
  # prediction = model.predict(predictable, batch_size=1)

  predictions = numpy.array([])

  predictable = predictable.reshape(predict_batch_size, 512 // predict_batch_size, 1)
  # print(predictable.shape)
  prediction = model.predict(predictable, batch_size=predict_batch_size)
  predictable = numpy.append(predictable, prediction)
  predictions = numpy.append(predictions, prediction)
  # predictions.append(prediction)

  predictions = predictions.reshape(-1, 1)
  # print("PREDICTIONS: ")
  # print(predictions)

  rescaled_predictions = scaler.inverse_transform(predictions)
  # print("PREDICTIONS RESCALED: ")
  # print(rescaled_predictions)

  plotted_preds = numpy.pad(rescaled_predictions, (512, 0), 'edge')
  pyplot.plot(measurements_only)
  pyplot.plot(running_meaned_measurements)
  pyplot.plot(plotted_preds)
  pyplot.ylabel('CO micro grams/m^3')
  pyplot.xlabel('epoch')
  pyplot.show()

  return jsonify(numpy.ndarray.tolist(rescaled_predictions))

def format_results(results):
  pollutant_history = {}

  for result in results:
    pollutant = result["parameter"]

    if pollutant not in pollutant_history:
      pollutant_history[pollutant] = []

    pollutant_history[pollutant].append([
      parse_date(result["date"]["utc"]).timestamp(),
      result["value"]
    ])

  return pollutant_history

def root_mean_squared_error(y_true, y_pred):
  return K.sqrt(K.mean(K.square(y_pred - y_true)))

def get_model_copy(batch_size, stateful):
  model = Sequential()
  model.add(LSTM(50, batch_input_shape=(batch_size, None, 1), stateful=True, return_sequences=False))
  # model.add(LSTM(5, batch_input_shape=(batch_size, None, 1), stateful=True, return_sequences=False))
  # model.add(LSTM(50, stateful=False, return_sequences=False))
  model.add(Dense(1))
  # model.add(Activation('relu'))

  optimizer = RMSprop()
  model.compile(loss='mean_squared_error', optimizer=optimizer)
  return model

def running_mean(array, N):
    cumsum = numpy.cumsum(array) 
    return (cumsum[N:] - cumsum[:-N]) / float(N)