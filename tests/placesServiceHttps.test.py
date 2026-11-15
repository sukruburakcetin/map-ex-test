"""Real CLI/TLS restart test. Requires OpenSSL; never disables TLS verification."""
import hashlib
import json
import os
from pathlib import Path
import shutil
import socket
import ssl
import subprocess
import sys
import tempfile
import time
import unittest
import urllib.error
import urllib.request

TOOLS = Path(__file__).resolve().parents[1] / 'tools/overture_places'
sys.path.insert(0,str(TOOLS))
from places_store import import_database


@unittest.skipUnless(shutil.which('openssl'),'OpenSSL is required to create the test-only trusted certificate')
class ServiceHttpsTest(unittest.TestCase):
    def test_cli_import_inspect_https_restart_update_and_rollback(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder);source=root/'source.geojsonl';database=root/'first.sqlite';next_database=root/'next.sqlite'
            manifest={'schema':'overture-places-all-pilot-v1','feature_count':2,'release':'2026-10-21.0','bbox':[28.9,40.9,29.1,41.1]}
            def save(release):
                records=[{'type':'Feature','geometry':{'type':'Point','coordinates':[29+i*.00001,41]},'properties':{'gers_id':str(i),'place_name':'Place '+str(i),'category':'restaurant','confidence':.9,'data_release':release}} for i in range(2)]
                source.write_text('\n'.join(json.dumps(row) for row in records))
                manifest['release']=release;source.with_suffix('.manifest.json').write_text(json.dumps(manifest))
            save(manifest['release'])
            imported=subprocess.run([sys.executable,str(TOOLS/'places_service.py'),'import','--input',str(source),'--database',str(database)],capture_output=True,text=True)
            self.assertEqual(imported.returncode,0,imported.stderr)
            self.assertEqual(json.loads(imported.stdout)['count'],2)
            save('2026-10-28.0');import_database(source,next_database)
            source.unlink();source.with_suffix('.manifest.json').unlink()
            inspected=subprocess.run([sys.executable,str(TOOLS/'places_service.py'),'inspect','--database',str(database)],capture_output=True,text=True)
            self.assertEqual(inspected.returncode,0,inspected.stderr)
            self.assertEqual(json.loads(inspected.stdout)['storage'],'sqlite')
            hashes={p:hashlib.sha256(p.read_bytes()).hexdigest() for p in [database,next_database]}
            cert,key=root/'cert.pem',root/'key.pem'
            created=subprocess.run(['openssl','req','-x509','-newkey','rsa:2048','-nodes','-days','1','-subj','/CN=localhost','-addext','subjectAltName=DNS:localhost,IP:127.0.0.1','-keyout',str(key),'-out',str(cert)],capture_output=True)
            self.assertEqual(created.returncode,0,created.stderr.decode())
            context=ssl.create_default_context(cafile=str(cert))
            with socket.socket() as listener:listener.bind(('127.0.0.1',0));port=listener.getsockname()[1]
            base=f'https://localhost:{port}/places';config=root/'service.json'
            def request(route,body=None,origin=None):
                headers={} if origin is None else {'Origin':origin}
                if body is not None:headers['Content-Type']='application/json'
                req=urllib.request.Request(base+route,data=None if body is None else json.dumps(body).encode(),headers=headers)
                return urllib.request.urlopen(req,context=context,timeout=2)
            geometry={'xmin':28.99,'ymin':40.99,'xmax':29.01,'ymax':41.01,'spatialReference':{'wkid':4326}}
            for selected,release in [(database,'2026-10-21.0'),(next_database,'2026-10-28.0'),(database,'2026-10-21.0')]:
                config.write_text(json.dumps({'database':selected.name,'public_url':base,'port':port,'origins':['https://app.example','https://builder.example'],'tls':{'cert':cert.name,'key':key.name}}))
                process=subprocess.Popen([sys.executable,str(TOOLS/'places_service.py'),'serve','--config',str(config)],cwd=root,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
                try:
                    deadline=time.monotonic()+12
                    while True:
                        if process.poll() is not None:self.fail(process.communicate()[1])
                        try:
                            with request('/health') as response:health=json.load(response)
                            break
                        except urllib.error.URLError:
                            if time.monotonic()>deadline:raise
                            time.sleep(.05)
                    self.assertEqual(health,{'ready':True,'storage':'sqlite','release':release})
                    with request('/status',origin='https://app.example') as response:
                        self.assertEqual(response.headers['Access-Control-Allow-Origin'],'https://app.example')
                        self.assertEqual(response.headers['Vary'],'Origin')
                        status=json.load(response);self.assertEqual(status['count'],2);self.assertEqual(status['release'],release)
                    with request('/status',origin='https://unlisted.example') as response:self.assertIsNone(response.headers.get('Access-Control-Allow-Origin'))
                    with request('/style.json?family=restaurant',origin='https://builder.example') as response:
                        style=json.load(response);self.assertEqual(response.headers['Access-Control-Allow-Origin'],'https://builder.example')
                        self.assertTrue(style['sprite'].startswith(base+'/'))
                        self.assertTrue(style['sources']['places']['tiles'][0].startswith(base+'/'))
                    with request('/sprites/places.json') as response:self.assertIn('restaurant',json.load(response))
                    from serve_places_local import project
                    x,y=project(29,41)
                    with request(f'/tiles/15/{int(x*32768)}/{int(y*32768)}.pbf') as response:
                        self.assertEqual(response.headers['Content-Type'],'application/x-protobuf')
                        self.assertTrue(response.read())
                    options=urllib.request.Request(base+'/search',method='OPTIONS',headers={'Origin':'https://builder.example','Access-Control-Request-Method':'POST'})
                    with urllib.request.urlopen(options,context=context,timeout=2) as response:
                        self.assertEqual(response.headers['Access-Control-Allow-Origin'],'https://builder.example')
                        self.assertIn('POST',response.headers['Access-Control-Allow-Methods'])

                    with request('/search',{'geometry':geometry,'text':'place','offset':0}) as response:
                        result=json.load(response);self.assertEqual(len(result['features']),2);self.assertEqual(result['offset'],0)
                        self.assertEqual(result['features'][0]['attributes']['data_release'],release)
                    with request('/query',{'geometry':geometry}) as response:self.assertEqual(len(json.load(response)['features']),2)
                    for invalid in [[],{'geometry':[]},{'geometry':{'spatialReference':[]}},{'geometry':{**geometry,'xmin':False}}]:
                        with self.assertRaises(urllib.error.HTTPError) as raised:request('/search',invalid)
                        self.assertEqual(raised.exception.code,400)
                finally:
                    process.terminate()
                    try:process.communicate(timeout=5)
                    except subprocess.TimeoutExpired:process.kill();process.communicate();self.fail('Service did not stop cleanly')
                if os.name == 'posix':self.assertEqual(process.returncode,0)
            for p,before in hashes.items():self.assertEqual(hashlib.sha256(p.read_bytes()).hexdigest(),before)
            self.assertFalse(list(root.glob('*-journal'))+list(root.glob('*-wal'))+list(root.glob('*-shm')))


if __name__=='__main__':unittest.main()
