import asyncio
import random

MAX_REQUESTS = 2
TIME_FRAME = .5
api_blocking_queue = []
api_lock = asyncio.BoundedSemaphore(MAX_REQUESTS)


async def locked_my_call(url):
  # Prepare the call so we can wait on it in multiple places
  async with api_lock:
    while len(api_blocking_queue) >= MAX_REQUESTS:
      done, _ = await asyncio.wait(api_blocking_queue,
                                   return_when=asyncio.FIRST_COMPLETED)
      for item in done:
        # Remove the done items so the length reduces.
        api_blocking_queue.remove(item)
    # We have space in the queue to add a new delay.
    # This will cause the next API call to wait for at most `TIME_FRAME`
    # Before running.
    api_blocking_queue.append(
        asyncio.ensure_future(asyncio.sleep(TIME_FRAME)))
    return await my_call(url)


async def my_call(url):
  print("Entering call", url)
  await asyncio.sleep(random.randint(50, 1000) / 1000)
  print("Exiting call", url)


async def async_main(use_lock):
  call = locked_my_call if use_lock else my_call
  futures = [call('http://g.co/{}'.format(idx)) for idx in range(0, 10)]
  await asyncio.wait(futures)
  for item in api_blocking_queue:
    item.cancel()  # Clean up tasks that are not required.


def main():
  loop = asyncio.get_event_loop()
  loop.set_debug(True)
  print("Using the locks")
  loop.run_until_complete(async_main(True))
  print('=' * 75)
  print('\nCalling the function on its own')
  loop.run_until_complete(async_main(False))


if __name__ == '__main__':
    main()
