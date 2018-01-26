from aiohttp import web
import json
import math

PAGES = 10
with open('presentation/kittens/individuals/images.json', 'r') as f:
    ALL_DATA = json.load(f)
    ALL_IDS = sorted(ALL_DATA.keys())
PAGE_SIZE = math.ceil(len(ALL_IDS) / PAGES)

async def handle(request):
    page = int(request.GET.get('page', '1'))
    assert 0 < page <= PAGES
    page_start = (page - 1) * PAGE_SIZE
    page_end = min((page) * PAGE_SIZE, len(ALL_IDS))
    ids = ALL_IDS[page_start:page_end]

    links = {
        'last': '{}://{}{}?page={}'.format(request.scheme, request.host, request.path, PAGES)
        'first': '{}://{}{}?page={}'.format(request.scheme, request.host, request.path, 1)
    }
    if page > 1:
        links['prev'] = '{}://{}{}?page={}'.format(request.scheme, request.host, request.path, page - 1)
    if page < PAGES:
        links['next'] = '{}://{}{}?page={}'.format(request.scheme, request.host, request.path, page + 1)

    link_hdr = ', '.join('<{}>; rel="{}"'.format(name, url) for name, url in links.items())
    return web.json_response(
        ids,
        headers={'Link': link_hdr}
    )
    return web.Response(body=text.encode('utf-8'))



app = web.Application()
app.router.add_route('GET', '/paginate', handle)

if __name__ == '__main__':
    web.run_app(app)
