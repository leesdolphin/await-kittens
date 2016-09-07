import requests

from kittens.output import KittenWriter
from . import download_kitten


def main():
    session = requests.session()
    with KittenWriter('v1') as writer:
        folder = writer.image_folder
        writer.add_all([
            download_kitten(session, folder, '5490797607'),
            download_kitten(session, folder, '3732837915'),
            download_kitten(session, folder, '15811753760'),
            download_kitten(session, folder, '2553836823')
        ])

if __name__ == '__main__':
    main()
