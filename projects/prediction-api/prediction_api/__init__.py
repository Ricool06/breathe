from .server import app
from multiprocessing import Process

__version__ = '0.1.0'
server = None

def main():
  app.run()
  # server = Process(target=app.run)
  # server.start()
