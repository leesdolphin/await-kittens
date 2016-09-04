import asyncio
import aiohttp

async def get_kitten(idx, image_url):
  async with aiohttp.get(image_url) as img:
    img.raise_for_status()
    content = await img.read()
  with open('parallel_kitten_{}.jpg'.format(idx), 'wb') as file:
    file.write(content)

async def async_main():
  (_, _) = await asyncio.gather(
    get_kitten(1, 'https://c2.staticflickr.com/6/'
                  '5601/15497374938_7239eb4d9f_k.jpg'),
    get_kitten(2, 'https://c2.staticflickr.com/4/'
                  '3288/4006914394_bcd2fe6539_o.jpg')
  )

loop = asyncio.get_event_loop()
loop.run_until_complete(async_main())
