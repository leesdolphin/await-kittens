import asyncio

import aiohttp

from kittens.output import KittenWriter

from . import Flickr, download_kitten


async def async_main():
    with aiohttp.ClientSession() as session:
        flickr = Flickr(session,
                        open('.flickr-key').read().strip())
        with KittenWriter('v3') as writer:
            folder = writer.image_folder
            downloads = []
            for kitten_id in ['5630633595', '6367077969', '5642852589',
                              '5630633419', '8522145980',
                              '4671107278', '7572923500',
                              '6157871473', '6157871473',
                              '5490797607', '3732837915',
                              '15811753760', '2553836823',
                              '4006914394', '15497374938',
                              '15745379826', '9160823116',
                              '15811753760', '16514598668']:
              downloads.append(download_kitten(flickr, folder, kitten_id))
            for pending_kitten in asyncio.as_completed(downloads):
              kitten = await pending_kitten
              writer.add(kitten)


def main():
    loop = asyncio.get_event_loop()
    loop.run_until_complete(async_main())
    loop.stop()

if __name__ == '__main__':
    main()
