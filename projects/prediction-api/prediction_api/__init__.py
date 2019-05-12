from .server import app
from multiprocessing import Process
from prediction_api.ml_model.create_model import create_model as create_ml_model

__version__ = '0.1.0'
server = None

def main():
  app.run()
  # server = Process(target=app.run)
  # server.start()

def create_model():
  print('Creating model file...')
  create_ml_model()