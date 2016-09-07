import asyncio
import aiohttp

from kittens.output import KittenWriter
from . import download_kitten


async def async_main():
  async with aiohttp.ClientSession() as session:
    with KittenWriter('v2') as writer:
      folder = writer.image_folder
      kitten_data = await asyncio.gather(
        download_kitten(session, folder, '4671107278'),
        download_kitten(session, folder, '9160823116'),
        download_kitten(session, folder, '15811753760'),
        download_kitten(session, folder, '8522145980')
      )
      writer.add_all(kitten_data)

def main():
  loop = asyncio.get_event_loop()
  loop.run_until_complete(async_main())

if __name__ == '__main__':
    main()
