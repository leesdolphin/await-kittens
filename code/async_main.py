import asyncio
import aiohttp

async def something_nice():
    text = await (await aiohttp.get('http://google.com')).text()
    print(text)


async def async_main(_loop):
    something_nice_future = asyncio.ensure_future(something_nice())
    print("Hello")
    await asyncio.sleep(5)
    print("--- World")
    return await something_nice_future


def sync_main():
    loop = asyncio.get_event_loop()
    print("Creating main")
    my_main = async_main(loop)
    print("Starting")
    loop.run_until_complete(my_main)
    print("Done")
    loop.close()


if __name__ == '__main__':
    sync_main()
