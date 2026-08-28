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
    "brown eggs tray isolated",
    "dairy products icon",
    "poultry icon",
    "vegetables icon",
    "bread icon",
    "eggs icon",
    "masala icon",
    "rice icon",
    "edible oil icon"
]

results = {}

req_headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
}

for q in queries:
    try:
        url = "https://html.duckduckgo.com/html/?q=" + urllib.parse.quote(q)
        req = urllib.request.Request(url, headers=req_headers)
        html = urllib.request.urlopen(req).read().decode('utf-8')
        
        # In DDG HTML, image URLs are in <img src="//external-content.duckduckgo.com/iu/?u=URL..."
        match = re.search(r'//external-content\.duckduckgo\.com/iu/\?u=([^&"\'\s]+)', html)
        if match:
            # URL decoded
            img_url = urllib.parse.unquote(match.group(1))
            results[q] = img_url
        else:
            results[q] = None
    except Exception as e:
        results[q] = str(e)

print(json.dumps(results, indent=2))
