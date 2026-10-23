import json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../server-python'))
from services.docx_generator import build_resume_docx
from http.server import BaseHTTPRequestHandler

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        body = json.loads(self.rfile.read(length))
        try:
            docx_bytes = build_resume_docx(body.get('resumeData', {}))
            self.send_response(200)
            self.send_header('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
            self.send_header('Content-Disposition', 'attachment; filename="ResumeForge.docx"')
            self.end_headers()
            self.wfile.write(docx_bytes)
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())
