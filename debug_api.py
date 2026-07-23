import requests

urls = ['http://127.0.0.1:5000/api/auth/login', 'http://localhost:5000/api/auth/login']
for url in urls:
    try:
        r = requests.post(url, json={'username': 'admin', 'password': 'admin123'})
        print('LOGIN', url, r.status_code)
        print(r.text)
        if r.status_code == 200:
            token = r.json()['access_token']
            r2 = requests.get(url.replace('/auth/login', '/orders'), headers={'Authorization': f'Bearer {token}'})
            print('ORDERS', url.replace('/auth/login', '/orders'), r2.status_code)
            print(r2.text)
    except Exception as e:
        print('ERR', url, e)
