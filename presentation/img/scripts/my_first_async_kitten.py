import asyncio
import aiohttp

async def my_first_kitten(image_url):
  async with aiohttp.get(image_url) as img:
    img.raise_for_status()
    content = await img.read()
  with open('first_async_kitten.jpg', 'wb') as file:
    file.write(content)

async def async_main():
  await my_first_kitten('https://c1.staticflickr.com/7/'
                        '6201/6128762944_72a4e5d2af_o_d.jpg')

loop = asyncio.get_event_loop()
loop.run_until_complete(async_main())
