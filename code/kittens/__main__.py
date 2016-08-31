import importlib
import pkgutil

from . import __path__ as parent_path


def download_all():
    qualname = __package__ + '.__main__'
    package_name = __package__
    for finder, name, ispkg in pkgutil.walk_packages(parent_path, package_name + '.'):
        if name != qualname and name.endswith('.__main__'):
            package_name, _, _ = name.rpartition('.')
            module = importlib.import_module(name, package_name)
            print('=' * 120)
            print(package_name)
            print('=' * 120)
            print('\n' * 3)
            module.main()
            print('\n' * 3)
            print('=' * 120)

if __name__ == '__main__':
    download_all()
