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
        kitten_dls = [
          download_kitten(flickr, folder, kitten_id)
          for kitten_id in ['4671107278', '9160823116',
                            '15811753760', '8522145980']
        ]
        kitten_data = await asyncio.gather(*kitten_dls)
        writer.add_all(kitten_data)


def main():
    loop = asyncio.get_event_loop()
    loop.run_until_complete(async_main())

if __name__ == '__main__':
    main()
