import requests

base = 'http://127.0.0.1:5000/api'

login = requests.post(f'{base}/auth/login', json={'username':'admin', 'password':'admin123'})
print('login', login.status_code)
print(login.text)
if login.status_code == 200:
    token = login.json().get('access_token')
    headers = {'Authorization': f'Bearer {token}'}
    for path in ['/dashboard/stats', '/dashboard/alerts', '/dashboard/low-stock', '/dashboard/recent-orders']:
        r = requests.get(base + path, headers=headers)
        print(path, r.status_code, r.text)
