import json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../server-python'))
from services.prompts import build_feedback_prompt
from services.llm_router import generate_structured_json
from http.server import BaseHTTPRequestHandler

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        body = json.loads(self.rfile.read(length))
        try:
            result = generate_structured_json(build_feedback_prompt(body.get('resumeData', {})))
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())
        except Exception as e:
            self.send_response(503)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())
