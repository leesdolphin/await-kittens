import asyncio

async def my_exception():
    raise Exception()

async def async_main():
    asyncio.ensure_future(my_exception())
    await asyncio.sleep(5)

loop = asyncio.get_event_loop()
loop.run_until_complete(async_main())
