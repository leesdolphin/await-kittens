#!/usr/bin/python3
import sys
import argparse
import pathlib
import requests


class FlickrApiError(Exception):

    def __init__(self, data):
        self.data = data
        self.code = data.get('code', -1)
        super().__init__(
            "Request failed(Code: {}), given reason: {}"
            .format(data.get('code', '??'), data.get('message', '??')))


def flickr_api(http, api_method, api_key, **api_params):
    api_params.update({
        'method': api_method,
        'api_key': api_key,
        'format': 'json',
        'nojsoncallback': 1
    })
    r = http.get('https://api.flickr.com/services/rest/', params=api_params)
    r.raise_for_status()  # HTTP Errors disappear here.
    try:
        data = r.json()
    except ValueError:
        # Flickr *disapointed face* - Sending me invalid data makes me sad.
        # Give me a hope to figure out what is going wrong.
        print('-' * 80)
        print('Request to {r.url} contained invalid json.'.format(r=r))
        print('Headers: {r.headers!r}'.format(r=r))
        print('Content: \n{r.text}'.format(r=r))
        print('-' * 80)
        raise
    if data.get('stat') != 'ok':
        # Flickr indicates failure by setting the `stat` variable.
        raise FlickrApiError(data)
    return data


def download_kitten(image_folder, http, api_key, photo_id):
    # We need to get the original secret so we can get the image.
    # We also need the author, license, title and photo page URL.
    # Also check the `candownload` permission.
    data = flickr_api(http, 'flickr.photos.getInfo', api_key, photo_id=photo_id)
    sizes = flickr_api(http, 'flickr.photos.getSizes', api_key, photo_id=photo_id)
    photo_data = get_photo_data(data['photo'])
    image_url, image_filename = get_image_url_from_sizes(photo_data, sizes)
    image = http.get(image_url, stream=True)
    # 3 cheers for pathlib.
    image_path = image_folder.joinpath(image_filename)
    with image_path.open('wb') as image_file:
        # Now download the image into the file.
        shutil.copyfileobj(image.raw(), image_file)
    photo_data['image_path'] = image_path
    # Return all the data.
    return photo_data



def main():
    api_key = open('api-key.secret').read().strip()
    # parser = create_parser()
    # opts = parser.parse(args)
    target_dir = pathlib.Path('./_imgs/')
    target_dir = target_dir.expanduser().resolve()
    target_dir.mkdir(parents=True, exist_ok=True)
    s = requests.Session()
    with open('./kittens-ids.txt') as ids:
        for img_id in ids:
            print(download_kitten(target_dir, s, api_key, img_id))





if __name__ == '__main__':
    main()
