from keras.layers import Dense, LSTM
from keras import Sequential
from keras.optimizers import RMSprop
from sklearn.preprocessing import StandardScaler
from keras.callbacks import LambdaCallback, ModelCheckpoint
import requests
from datetime import datetime, timedelta
from dateutil.parser import parse as parse_date
import numpy
from keras.preprocessing.sequence import TimeseriesGenerator
from sklearn.preprocessing import StandardScaler, MinMaxScaler

def create_model():
  batch_size = 128
  length = 128

  training_latitude = '50.37167'
  training_longitude = '-4.142361'
  training_generator = prepare_series_generator(training_latitude, training_longitude, batch_size, length)

  validation_latitude = '39.2133'
  validation_longitude = '117.1837'
  validation_generator = prepare_series_generator(validation_latitude, validation_longitude, batch_size, length)

  model = construct_untrained_model(batch_size, stateful=False)

  history = model.fit_generator(
    training_generator,
    validation_data=training_generator,
    epochs=100,
    callbacks=[
      LambdaCallback(on_epoch_end=lambda epoch, logs: model.reset_states()),
      ModelCheckpoint('pollution_forecast_model_5.h5', save_best_only=True)
      ],
    shuffle=False
  )

def prepare_series_generator(latitude, longitude, batch_size, length):
  times, values = fetch_test_data('pm25', latitude, longitude)

  scaled_values = reshape_data_to_fit(values, batch_size)

  return TimeseriesGenerator(
    scaled_values,
    scaled_values,
    length=length,
    batch_size=batch_size,
    sampling_rate=1
  )

def reshape_data_to_fit(values, batch_size):
  number_of_values_to_remove = len(values) % batch_size
  number_of_values_to_keep = len(values) - number_of_values_to_remove
  values_cropped = values[-number_of_values_to_keep:]

  scaler = MinMaxScaler(feature_range=(0, 1))
  return scaler.fit_transform(values_cropped.reshape(-1, 1))

def construct_untrained_model(batch_size, stateful):
  model = Sequential()
  model.add(LSTM(4, batch_input_shape=(batch_size, None, 1), stateful=True, return_sequences=False))
  model.add(Dense(1))

  optimizer = RMSprop(0.0005)
  model.compile(loss='mean_squared_error', optimizer='adam')
  return model


def fetch_test_data(pollutant, latitude, longitude):
  results = get_measurements_from_api(pollutant, latitude, longitude)

  times, values = prepare_results(results, pollutant)

  return times, values

def get_measurements_from_api(pollutant, latitude, longitude):
  page = 1
  should_get_next_page = True
  results = []
  now = datetime.utcnow()

  while should_get_next_page:
    response = requests.get(
      'https://api.openaq.org/v1/measurements',
      params={
        'coordinates': latitude + ',' + longitude,
        'radius': '100',
        'has_geo': 'true',
        'limit': '10000',
        'date_from': (now - timedelta(days=90)).isoformat() + 'Z',
        'date_to': now.isoformat() + 'Z',
        'parameter': pollutant,
        'page': str(page),
      },
    )

    response = response.json()

    should_get_next_page = len(response["results"]) > 0
    page += 1
    results.extend(response["results"])

  return results

def prepare_results(results, pollutant):
  sorted_pollutant_history = format_results(results)
  interpolated_times, interpolated_values = interpolate_values(history=sorted_pollutant_history, interval_in_seconds=3600)
  smoothed_values = smooth_values(interpolated_values)

  return interpolated_times, smoothed_values

def format_results(results):
  pollutant_history = []

  for result in results:
    pollutant_history.append([
      int(parse_date(result["date"]["utc"]).timestamp()),
      result["value"]
    ])

  pollutant_history = numpy.array(pollutant_history)
  return pollutant_history[pollutant_history[:, 0].argsort()]

def interpolate_values(history, interval_in_seconds):
  first_timestamp = history[0][0]
  last_timestamp = history[-1][0]

  interpolated_times = [time for time in range(first_timestamp, last_timestamp, 3600)]
  existing_times = history[:, 0]
  existing_values = history[:, 1]

  interpolated_values = numpy.interp(interpolated_times, existing_times, existing_values)

  return interpolated_times, interpolated_values

def smooth_values(values, smoothing_factor=24):
  smoothing_factor = smoothing_factor - (smoothing_factor % 2) # Ensure smoothing factor is even
  return numpy.pad(
    running_mean(values, n=smoothing_factor),
    (smoothing_factor // 2, smoothing_factor // 2),
    'edge'
  )

def running_mean(values, n):
  cumsum = numpy.cumsum(values)
  return (cumsum[n:] - cumsum[:-n]) / float(n)