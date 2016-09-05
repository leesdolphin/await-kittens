import importlib
import pkgutil

from . import __path__ as parent_path


PRESENTATION_IDS = [
    '6157871473',  # Openning slide
    '5630633595',  # First async kitten.
]
async def async_download_presentation_kittens():
    import asyncio
    import aiohttp
    from .output import KittenWriter
    from .v3_async_dl import Flickr, download_kitten
    async with aiohttp.ClientSession() as session:
        flickr = Flickr(session,
                        open('.flickr-key').read().strip())
        with KittenWriter('pres', create_combined=False) as writer:
            folder = writer.image_folder
            writer.add_all(await asyncio.gather(*[
                download_kitten(flickr, folder, kitten_id)
                for kitten_id in PRESENTATION_IDS
            ]))


def download_presentation_kittens():
    import asyncio
    loop = asyncio.get_event_loop()
    loop.run_until_complete(async_download_presentation_kittens())


def download_all():
    download_presentation_kittens()
    qualname = __package__ + '.__main__'
    package_name = __package__
    for finder, name, ispkg in pkgutil.walk_packages(parent_path, package_name + '.'):
        if name != qualname and name.endswith('.__main__'):
            package_name, _, _ = name.rpartition('.')
            module = importlib.import_module(name, package_name)
            print('=' * 120)
            print(package_name)
            print('=' * 120)
            print('\n' * 3)
            module.main()
            print('\n' * 3)
            print('=' * 120)

if __name__ == '__main__':
    download_all()
