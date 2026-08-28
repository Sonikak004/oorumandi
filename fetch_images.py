import urllib.request
import re
import json

queries = [
    "Nandini orange milk packet",
    "Nandini curd pouch",
    "raw chicken pieces isolated white background",
    "raw chicken keema isolated",
    "red onion isolated white background",
    "red tomato isolated white background",
    "raw potato isolated white background",
    "carrot isolated white background",
    "green chilli isolated white background",
    "coriander leaves isolated white background",
    "white bread slices packet isolated",
    "brown bread packet isolated",
    "burger buns packet isolated",
    "pav bread packet isolated",
    "white eggs tray isolated",
    "brown eggs tray isolated"
]

results = {}

req_headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

for q in queries:
    try:
        url = "https://www.google.com/search?q=" + urllib.parse.quote(q) + "&tbm=isch"
        req = urllib.request.Request(url, headers=req_headers)
        html = urllib.request.urlopen(req).read().decode('utf-8')
        
        # Find the first encrypted-tbn0 thumbnail
        match = re.search(r'(https://encrypted-tbn0\.gstatic\.com/images\?q=tbn:[^&"\'\s]+)', html)
        if match:
            results[q] = match.group(1)
        else:
            results[q] = None
    except Exception as e:
        results[q] = str(e)

print(json.dumps(results, indent=2))
