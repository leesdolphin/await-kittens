import asyncio
import json
from kittens.flickr_helpers import FlickrApiError, get_image_url_from_sizes, get_photo_data


class Flickr():

  def __init__(self, aio_session, api_key):
    self.session = aio_session
    self.default_params = dict(format='json', nojsoncallback=1,
                               api_key=api_key)

  async def api_call(self, api_method, **api_params):
    api_params.update(method=api_method, **self.default_params)
    async with self.session.get(
        'https://api.flickr.com/services/rest/',
        params=api_params) as r:
      r.raise_for_status()
      data = await r.json()
    if data.get('stat') != 'ok':
        # Flickr indicates failure by setting the `stat` variable.
        raise FlickrApiError(data)
    print('api_call', api_method)
    return data


async def do_kitten_dl(flickr, image_folder, photo_id):
  sizes = await flickr.api_call('flickr.photos.getSizes',
                                photo_id=photo_id)
  image_url, image_filename = get_image_url_from_sizes(sizes)
  image_path = image_folder + '/' + image_filename

  async with flickr.session.get(image_url) as img:
    img.raise_for_status()
    content = await img.read()
  with open(image_path, 'wb') as file:
    file.write(content)
  return {'image_path': image_path}


async def download_kitten(flickr, image_folder, photo_id):
  data, dl_data = await asyncio.gather(
    flickr.api_call('flickr.photos.getInfo',
                    photo_id=photo_id),
    do_kitten_dl(flickr, image_folder, photo_id)
  )
  photo_data = get_photo_data(data)
  photo_data.update(dl_data)
  return photo_data
