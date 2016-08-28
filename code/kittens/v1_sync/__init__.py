import shutil

from kittens.flickr_helpers import FlickrApiError, get_image_url_from_sizes, get_photo_data


class Flickr():

    def __init__(self, session, api_key):
        self.session = session
        self.default_params = dict(format='json', nojsoncallback=1,
                                   api_key=api_key)

    def api_call(self, api_method, **api_params):
        api_params.update(method=api_method, **self.default_params)
        r = self.session.get('https://api.flickr.com/services/rest/',
                             params=api_params)
        r.raise_for_status()  # HTTP Errors disappear here.
        data = r.json()  # Invalid JSON errors disappear here.
        if data.get('stat') != 'ok':
            # Flickr indicates failure by setting the `stat` variable.
            raise FlickrApiError(data)
        return data


def download_kitten(flickr, image_folder, photo_id):
    data = flickr.api_call('flickr.photos.getInfo', photo_id=photo_id)
    sizes = flickr.api_call('flickr.photos.getSizes', photo_id=photo_id)

    photo_data = get_photo_data(data)
    image_url, image_filename = \
        get_image_url_from_sizes(sizes)

    image_path = image_folder + '/' + image_filename
    photo_data['image_path'] = image_path

    # image_url, image_path from previous slide.
    img = flickr.session.get(image_url, stream=True)
    img.raise_for_status()
    with open(image_path, 'wb') as file:
        shutil.copyfileobj(img.raw, file)
    return photo_data
