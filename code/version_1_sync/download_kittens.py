#!/usr/bin/python3
# import sys
# import argparse
import pathlib
import shutil
import traceback

from flickr_helpers import FlickrHelper, UnsupportedPhotoError

import requests


class FlickrApiError(Exception):

    def __init__(self, data):
        self.data = data
        self.code = data.get('code', -1)
        super().__init__(
            "Request failed(Code: {}), given reason: {}"
            .format(data.get('code', '??'), data.get('message', '??')))


class Flickr(FlickrHelper):

    def __init__(self, http, api_key):
        self.http = http
        self.api_key = api_key

    def api_call(self, api_method, **api_params):
        print(api_method, api_params)
        api_params.update(method=api_method, api_key=self.api_key,
                          format='json', nojsoncallback=1)
        r = self.http.get('https://api.flickr.com/services/rest/',
                          params=api_params)
        print(r, r.text)
        r.raise_for_status()  # HTTP Errors disappear here.
        try:
            data = r.json()
            if data.get('stat') != 'ok':
                # Flickr indicates failure by setting the `stat` variable.
                raise FlickrApiError(data)
        except (ValueError, FlickrApiError):
            # Flickr *disapointed face* - Sending me invalid data makes me sad.
            # Give me a hope to figure out what is going wrong.
            print('-' * 80)
            print('Request to {r.url} failed.'.format(r=r))
            print('Headers: {r.headers!r}'.format(r=r))
            print('Content: \n{r.text}'.format(r=r))
            print('-' * 80)
            raise
        return data


def download_kitten(flickr, image_folder, photo_id):
    """Do thing."""
    # We need to get the original secret so we can get the image.
    # We also need the author, license, title and photo page URL.
    # Also check the `candownload` permission.
    data = flickr.api_call('flickr.photos.getInfo', photo_id=photo_id)
    sizes = flickr.api_call('flickr.photos.getSizes', photo_id=photo_id)
    try:
        photo_data = flickr.get_photo_data(data)
        img_url, img_fname = flickr.get_image_url_from_sizes(sizes)
    except UnsupportedPhotoError:
        print(traceback.print_exc())
        return None
    image = flickr.http.get(img_url, stream=True)
    # 3 cheers for pathlib.
    image_path = image_folder.joinpath(img_fname)
    with image_path.open('wb') as image_file:
        # Now download the image into the file.
        shutil.copyfileobj(image.raw, image_file)
    photo_data['image_path'] = image_path
    # Return all the data.
    return photo_data


def main():
    api_key = open('api-key.secret').read().strip()
    # parser = create_parser()
    # opts = parser.parse(args)
    target_dir = pathlib.Path('./_imgs/')
    target_dir.mkdir(parents=True, exist_ok=True)
    s = requests.Session()
    flickr = Flickr(s, api_key)
    with open('./kittens-ids.txt') as ids:
        for img_id in ids:
            img_id = img_id.strip()
            if not img_id:
                continue
            print(download_kitten(flickr, target_dir, img_id))

"""27287612025
5715136208
6128204818
27544726476


26494711833
8508190009
26905387502
27467397252
4802842096
3363622294
26808378174
10901734724
7017518997
10394781846
15905067924
16443794696
9614939766
9058312147
"""


if __name__ == '__main__':
    main()
