"""
Lightweight development HTTP server to serve the scroll animation website.
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable caching headers for WebP images while allowing hot reloads
        if self.path.endswith(('.webp', '.png', '.jpg')):
            self.send_header('Cache-Control', 'public, max-age=3600')
        else:
            self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

def run_server(port=PORT):
    # Try preferred port, or fall back to an open port if busy
    for test_port in range(port, port + 20):
        try:
            with socketserver.TCPServer(("", test_port), Handler) as httpd:
                url = f"http://localhost:{test_port}/index.html"
                print("=" * 60)
                print(f"  Continuous Scroll Animation Website is LIVE!")
                print(f"  URL: {url}")
                print(f"  Press Ctrl+C to stop the server.")
                print("=" * 60)
                
                # Automatically open in the user's default browser
                webbrowser.open(url)
                httpd.serve_forever()
                return
        except OSError as e:
            if "Address already in use" in str(e) or e.errno == 10048:
                continue
            raise

if __name__ == "__main__":
    run_server()
