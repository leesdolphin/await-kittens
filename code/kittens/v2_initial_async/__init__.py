from kittens.flickr_helpers import FlickrApiError, get_image_url_from_sizes, get_photo_data

from kittens import get_api_key


async def api_call(session, api_method, **api_params):
  api_params.update(method=api_method, format='json',
                    nojsoncallback=1, api_key=get_api_key())
  async with session.get('https://api.flickr.com/services/rest/',
                         params=api_params) as r:
    r.raise_for_status()  # HTTP Errors disappear here.
    data = await r.json()  # Invalid JSON errors disappear here.
  if data.get('stat') != 'ok':
    # Flickr indicates failure by setting the `stat` variable.
    raise FlickrApiError(data)
  return data


async def download_kitten(session, image_folder, photo_id):
  data = await api_call(session, 'flickr.photos.getInfo',
                        photo_id=photo_id)
  sizes = await api_call(session, 'flickr.photos.getSizes',
                         photo_id=photo_id)

  photo_data = get_photo_data(data)
  dl_data = get_image_url_from_sizes(image_folder, sizes)
  photo_data.update(dl_data)

  # image_url, image_path from previous slide.
  async with session.get(dl_data['image_url']) as img:
    img.raise_for_status()
    content = await img.read()
  with open(dl_data['image_path'], 'wb') as file:
    file.write(content)
  return photo_data
