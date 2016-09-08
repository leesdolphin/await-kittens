import asyncio
import random

MAX_INFLIGHT_REQUESTS = 2
api_lock = asyncio.BoundedSemaphore(MAX_INFLIGHT_REQUESTS)

async def locked_my_call(url):
  async with api_lock:
    return await my_call(url)

async def my_call(url):
  print("Entering call", url)
  await asyncio.sleep(random.randint(50, 1000) / 1000)
  print("Exiting call", url)


async def async_main(use_lock):
  call = locked_my_call if use_lock else my_call
  futures = [call('http://g.co/{}'.format(idx)) for idx in range(0, 10)]
  await asyncio.wait(futures)


def main():
  loop = asyncio.get_event_loop()
  print("Using the locks")
  loop.run_until_complete(async_main(True))
  print('=' * 75)
  print('\nCalling the function on its own')
  loop.run_until_complete(async_main(False))


if __name__ == '__main__':
    main()
