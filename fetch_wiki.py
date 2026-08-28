import urllib.request
import urllib.parse
import json

queries = {
    "onion": "Onion",
    "tomato": "Tomato",
    "potato": "Potato",
    "carrot": "Carrot",
    "green chilli": "Chili_pepper",
    "coriander": "Coriander",
    "white bread": "White_bread",
    "brown bread": "Brown_bread",
    "burger bun": "Bun",
    "egg": "Egg_(food)",
    "raw chicken": "Chicken_meat",
    "milk": "Milk",
    "curd": "Curd",
    "masala": "Spice",
    "rice": "Rice",
    "oil": "Cooking_oil"
}

results = {}

req_headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
}

for key, title in queries.items():
    try:
        url = f"https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles={title}"
        req = urllib.request.Request(url, headers=req_headers)
        response = urllib.request.urlopen(req).read().decode('utf-8')
        data = json.loads(response)
        
        pages = data['query']['pages']
        page = list(pages.values())[0]
        if 'original' in page:
            results[key] = page['original']['source']
        else:
            # Try to get thumbnail instead
            url_thumb = f"https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&pithumbsize=500&titles={title}"
            req_thumb = urllib.request.Request(url_thumb, headers=req_headers)
            response_thumb = urllib.request.urlopen(req_thumb).read().decode('utf-8')
            data_thumb = json.loads(response_thumb)
            page_thumb = list(data_thumb['query']['pages'].values())[0]
            if 'thumbnail' in page_thumb:
                results[key] = page_thumb['thumbnail']['source']
            else:
                results[key] = None
    except Exception as e:
        results[key] = str(e)

print(json.dumps(results, indent=2))
