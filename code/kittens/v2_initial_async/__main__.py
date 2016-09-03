import asyncio
import aiohttp

from kittens.output import KittenWriter
from . import Flickr, download_kitten


async def async_main():
    with aiohttp.ClientSession() as session:
        flickr = Flickr(session,
                        open('.flickr-key').read().strip())
        with KittenWriter('v2') as writer:
            folder = writer.image_folder
            writer.add_all([
                await download_kitten(flickr, folder, '15745379826'),
                await download_kitten(flickr, folder, '9160823116'),
                await download_kitten(flickr, folder, '15811753760'),
                await download_kitten(flickr, folder, '16514598668')
            ])


def main():
    loop = asyncio.get_event_loop()
    loop.run_until_complete(async_main())

if __name__ == '__main__':
    main()
