from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import time, threading, re
root=Path(__file__).resolve().parents[1]/'public'
lock=threading.Lock(); next_send=0
class Handler(SimpleHTTPRequestHandler):
 def do_GET(self):
  global next_send
  path=root/self.path.split('?')[0].lstrip('/')
  path=path.resolve()
  if not path.is_relative_to(root.resolve()) or not path.is_file(): self.send_error(404); return
  time.sleep(.1)
  size=path.stat().st_size; start=0;end=size-1
  m=re.match(r'bytes=(\d+)-(\d*)',self.headers.get('Range',''))
  if m: start=int(m[1]);end=min(int(m[2]) if m[2] else end,end)
  self.send_response(206 if m else 200)
  self.send_header('Content-Type','video/mp4' if path.suffix=='.mp4' else 'image/jpeg')
  self.send_header('Content-Length',str(end-start+1));self.send_header('Accept-Ranges','bytes')
  self.send_header('Access-Control-Allow-Origin','*');self.send_header('Cache-Control','no-store')
  if m:self.send_header('Content-Range',f'bytes {start}-{end}/{size}')
  self.end_headers()
  try:
   with path.open('rb') as f:
    f.seek(start); remaining=end-start+1
    while remaining:
     data=f.read(min(16384,remaining))
     with lock:
      scheduled=max(time.monotonic(),next_send); next_send=scheduled+len(data)/1250000
     time.sleep(max(0,scheduled-time.monotonic()));self.wfile.write(data);self.wfile.flush();remaining-=len(data)
  except (BrokenPipeError,ConnectionResetError):pass
 def log_message(self,*args):pass
ThreadingHTTPServer(('127.0.0.1',5179),Handler).serve_forever()
