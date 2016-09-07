import asyncio
import importlib
import pkgutil
import sys
import subprocess

from . import __path__ as parent_path


PRESENTATION_IDS = [
    '5791484713',  # Openning slide
    '5630633595',  # First async kitten.
    '15497374938',  # Parallel async kitten.
    '4006914394',
    '2379746512',
    '7433574198',
    '8483159997',
    '6128762944'
]
async def async_download_presentation_kittens():
    import asyncio
    import aiohttp
    from .output import KittenWriter
    from .v3_async_dl import download_kitten
    async with aiohttp.ClientSession() as session:
        with KittenWriter('pres', create_combined=False) as writer:
            folder = writer.image_folder
            writer.add_all(await asyncio.gather(*[
                download_kitten(session, folder, kitten_id)
                for kitten_id in PRESENTATION_IDS
            ]))


async def await_process(process, prefix=''):
    so = process.stdout
    se = process.stderr
    sorl, serl = None, None
    not_done = True
    proc_wait = asyncio.ensure_future(process.wait())
    while process.returncode is None or not_done:
        if so.at_eof() and se.at_eof():
            await proc_wait
            break
        waiters = []
        if process.returncode is None:
            waiters.append(proc_wait)
        if not so.at_eof():
            if sorl is None:
                sorl = asyncio.ensure_future(process.stdout.readline())
            waiters.append(sorl)
        if not se.at_eof():
            if serl is None:
                serl = asyncio.ensure_future(process.stderr.readline())
            waiters.append(serl)
        done, not_done = await asyncio.wait(waiters,
                                            return_when=asyncio.FIRST_COMPLETED)
        if sorl in done:
            out = (await sorl).decode('utf-8')[:-1]
            if out:
                print(prefix, '|', out)
            sorl = None
        if serl in done:
            out = (await serl).decode('utf-8')[:-1]
            if out:
                print(prefix, '|', out)
            serl = None
    print(prefix, process.returncode)


async def exec_module(name):
    try:
        process = await asyncio.create_subprocess_exec(
            sys.executable, '-m', name,
            stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        await await_process(process, name)
    except Exception as e:
        print(e)
        raise e

async def async_download_all():
    qualname = __package__ + '.__main__'
    package_name = __package__
    runs = [
        async_download_presentation_kittens()
    ]
    for finder, name, ispkg in \
            pkgutil.walk_packages(parent_path, package_name + '.'):
        if name != qualname and name.endswith('.__main__'):
            runs.append(exec_module(name))
    await asyncio.wait(runs)


def download_all():
    loop = asyncio.get_event_loop()
    loop.set_debug(True)
    loop.run_until_complete(async_download_all())
    loop.close()

if __name__ == '__main__':
    download_all()
