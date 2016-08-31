import requests

from kittens.output import KittenWriter
from . import Flickr, download_kitten


def main():
    flickr = Flickr(requests.session(),
                    open('.flickr-key').read().strip())
    with KittenWriter('v1') as writer:
        folder = writer.image_folder
        writer.add_all([
            download_kitten(flickr, folder, '5490797607'),
            download_kitten(flickr, folder, '3732837915'),
            download_kitten(flickr, folder, '15811753760'),
            download_kitten(flickr, folder, '2553836823')
        ])

if __name__ == '__main__':
    main()
