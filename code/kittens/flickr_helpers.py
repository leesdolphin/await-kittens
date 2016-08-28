

class UnsupportedPhotoError(Exception):

    pass


class FlickrApiError(Exception):

    def __init__(self, data):
        self.data = data
        self.code = data.get('code', -1)
        super().__init__(
            "Request failed(Code: {}), given reason: {}"
            .format(data.get('code', '??'), data.get('message', '??')))


def base58_encode(num):
    # Taken from https://github.com/micahwalter/base58_encoded/blob/a9fbd4bef/base58_encoded/__init__.py
    alphabet = '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'
    base_count = len(alphabet)
    encoded = ''
    while num >= base_count:
        div = num / base_count
        mod = (num - (base_count * int(div)))
        encoded = alphabet[mod] + encoded
        num = int(div)
    if num:
        encoded = alphabet[num] + encoded
    return encoded


def get_photo_data(raw_photo_info_resp):
    """
    Extract information from the `photo` key of the `flickr.photos.getInfo`.

    Raises `UnsupportedPhotoError` if any preconditions to downloading it
    fail.
    """
    data_photo = raw_photo_info_resp['photo']
    if int(data_photo.get('safety_level', 0)) >= 2:
        raise UnsupportedPhotoError('Bad safety level')
    if data_photo.get('media', None) != 'photo':
        raise UnsupportedPhotoError('Not a photo')
    if not int(data_photo.get('visibility', {}).get('ispublic', False)):
        raise UnsupportedPhotoError('Not public')
    if not int(data_photo.get('usage', {}).get('candownload', False)):
        raise UnsupportedPhotoError('Not downloadable')
    license = get_photo_license(data_photo['license'])
    data = dict(
        id=int(data_photo['id']),
        short_url='https://flic.kr/p/' + base58_encode(int(data_photo['id'])),
        short_no_scheme_url='flic.kr/p/' + base58_encode(int(data_photo['id'])),
        license=license,
        title=data_photo['title']['_content'],
        description=data_photo['description']['_content'],
    )
    urls = {}
    for url_data in data_photo.get('urls', {}).get('url', []):
        if 'type' not in url_data or '_content' not in url_data:
            continue
        urls[url_data['type']] = url_data['_content']
    data['urls'] = urls
    print(data_photo.get('owner', {}))
    owner = dict(
        id=data_photo.get('owner', {})['nsid'],
        username=data_photo.get('owner', {}).get('username', ''),
        realname=data_photo.get('owner', {}).get('realname', ''),
        path_alias=data_photo.get('owner', {}).get('path_alias', ''),
    )
    owner['path'] = owner['path_alias'] or owner['id']
    data['owner'] = owner
    return data


def get_photo_license(license_id):
    licenses = {
        0: {"name": "All Rights Reserved", "url": ""},
        1: {"name": "Attribution-NonCommercial-ShareAlike License",
            "url": "https://creativecommons.org/licenses/by-nc-sa/2.0/"},
        2: {"name": "Attribution-NonCommercial License",
            "url": "https://creativecommons.org/licenses/by-nc/2.0/"},
        3: {"name": "Attribution-NonCommercial-NoDerivs License",
            "url": "https://creativecommons.org/licenses/by-nc-nd/2.0/"},
        4: {"name": "Attribution License",
            "url": "https://creativecommons.org/licenses/by/2.0/"},
        5: {"name": "Attribution-ShareAlike License",
            "url": "https://creativecommons.org/licenses/by-sa/2.0/"},
        6: {"name": "Attribution-NoDerivs License",
            "url": "https://creativecommons.org/licenses/by-nd/2.0/"},
        7: {"name": "No known copyright restrictions",
            "url": "https://www.flickr.com/commons/usage/"},
        8: {"name": "United States Government Work",
            "url": "http://www.usa.gov/copyright.shtml"},
        9: {"name": "Public Domain Dedication (CC0)",
            "url": "https://creativecommons.org/publicdomain/zero/1.0/"},
        10: {"name": "Public Domain Mark",
             "url": "https://creativecommons.org/publicdomain/mark/1.0/"}
    }
    return licenses[int(license_id)]


def get_image_url_from_sizes(raw_photo_sizes_resp):
    # Get the smallest size with both W&H > 700 and one of W/H>1024
    if not int(raw_photo_sizes_resp.get('sizes', {}).get('candownload', False)):
        raise UnsupportedPhotoError('Not downloadable')
    all_sizes = raw_photo_sizes_resp.get('sizes', {}).get('size')
    for size_data in all_sizes:
        size_data['width'] = int(size_data['width'])
        size_data['height'] = int(size_data['height'])
    all_sizes = sorted(all_sizes,
                       key=lambda item: (item['width'], item['height']))
    for size_data in all_sizes:
        width = size_data['width']
        height = size_data['height']
        img_url = size_data['source']
        if min(width, height) < 600 or max(width, height) < 1024:
            continue
        else:
            break
    _, _, filename = img_url.rpartition('/')
    return img_url, filename
