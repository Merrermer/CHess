import os
import sys
import subprocess
import time
import webbrowser
import signal

def start_server(command, name):
    """Start a server process with the given command"""
    print(f"Starting {name}...")
    try:
        process = subprocess.Popen(command, shell=True)
        print(f"{name} started with PID {process.pid}")
        return process
    except Exception as e:
        print(f"Error starting {name}: {e}")
        return None

def stop_server(process, name):
    """Stop a server process"""
    if process:
        print(f"Stopping {name}...")
        process.terminate()
        try:
            process.wait(timeout=5)
            print(f"{name} stopped")
        except subprocess.TimeoutExpired:
            print(f"{name} did not terminate gracefully, killing...")
            process.kill()

def main():
    """Main function to run both servers"""
    # Check if Python requirements are installed
    try:
        import flask
        import flask_cors
        import numpy
    except ImportError:
        print("Installing Python requirements...")
        subprocess.call([sys.executable, "-m", "pip", "install", "-r", "python/requirements.txt"])
    
    # Start the web server
    http_server = start_server("node server.js", "HTTP Server")
    
    # Start the Python API server
    os.chdir("python")
    python_api = start_server(f"{sys.executable} api.py", "Python API Server")
    os.chdir("..")
    
    # Open the app in the browser
    time.sleep(2)  # Give servers time to start
    webbrowser.open("http://localhost:3000")
    
    print("\nBoth servers are running. Press Ctrl+C to stop them.")
    
    try:
        # Keep the main thread alive
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nReceived keyboard interrupt, shutting down...")
    finally:
        # Stop both servers
        stop_server(http_server, "HTTP Server")
        stop_server(python_api, "Python API Server")
        
        print("All servers stopped. Goodbye!")

if __name__ == "__main__":
    main() 