import glob
from os import path

from setuptools import find_packages, setup

# Useful tutorial: https://wiki.python.org/moin/Distutils/Tutorial
# setuptools docs: http://pythonhosted.org/setuptools/
# Generated using cookiecutter. The template is avaliable:
#  https://github.com/wdm0006/cookiecutter-pipproject

__version__ = '0.0.1'

here = path.abspath(path.dirname(__file__))
# Get the long description from the README file
# with open(path.join(here, '../README.rst'), encoding='utf-8') as f:
long_description = "TODO"

template_files = glob.glob(path.join(here, 'kittens/templates/*'))

setup(
    name='await_kittens',
    version=__version__,
    description='',
    long_description=long_description,
    url='',
    license='GPLv3',
    classifiers=[
        'Development Status :: 3 - Alpha',
        'Intended Audience :: Developers',
        'Programming Language :: Python :: 3',
    ],
    keywords='',
    install_requires=[
        'ago',
        'aiohttp',
        'jinja2',
        'requests',
    ],
    packages=find_packages(include=['kittens*']) + ['kittens.templates'],
    package_data={
        'kittens.templates': ['*']
    },
    entry_points={
        'console_scripts': [
            # Format: 'exec = module.file:main_func'
            'html_refresh = kittens.output:refresh_all_templated_files',
            'download_all = kittens.__main__:download_all'
        ]
    },
    author='Lee Symes',
    author_email='lee@catalyst.net.nz'
)
