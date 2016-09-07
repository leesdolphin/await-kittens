import asyncio

import aiohttp

from kittens.output import KittenWriter

from . import download_kitten


async def async_main():
    async with aiohttp.ClientSession() as session:
        with KittenWriter('v3') as writer:
            folder = writer.image_folder
            downloads = []
            for kitten_id in [
                '5009756482',
                '5771289515',
                '5642852589',
                '6367077969',
            ]:
              downloads.append(download_kitten(session, folder, kitten_id))
            writer.add_all(await asyncio.gather(*downloads))


def main():
    loop = asyncio.get_event_loop()
    loop.run_until_complete(async_main())

if __name__ == '__main__':
    main()
