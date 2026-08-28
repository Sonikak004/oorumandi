from duckduckgo_search import DDGS
import json
import time

queries = [
    "Nandini orange milk packet white background",
    "Nandini curd pouch isolated",
    "raw chicken pieces isolated white background",
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

with DDGS() as ddgs:
    for q in queries:
        try:
            res = list(ddgs.images(q, max_results=1))
            if res:
                results[q] = res[0]['image']
            else:
                results[q] = None
            time.sleep(1)
        except Exception as e:
            results[q] = str(e)

print(json.dumps(results, indent=2))
