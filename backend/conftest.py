import sys
import os

# Add the backend folder to sys.path so 'app' can be imported everywhere
backend_dir = os.path.abspath(os.path.dirname(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
