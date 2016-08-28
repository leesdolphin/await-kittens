import datetime
import json
import pathlib
import pickle

import ago

from jinja2 import Environment, PackageLoader, Undefined
from jinja2.filters import do_mark_safe, escape


GIT_ROOT = pathlib.Path(__file__).parent.parent.parent
PRESENTATION_DIR = GIT_ROOT / 'presentation'
KITTENS_DIR = PRESENTATION_DIR / 'kittens'


def jinja_filter_license_html(license):
    if not license or 'url' not in license:
        return ''
    license_prefix = ''
    license_str = license['name']
    license_url = license['url']
    if license['url'].startswith('https://creativecommons.org/licenses/'):
        # Creative commons license. Provide a shorter form
        license_specifier = license['url'][len('https://creativecommons.org/licenses/'):]
        license_specifier = license_specifier.strip('/')
        license_type, _, license_ver = license_specifier.partition('/')
        license_types = map(str.upper, license_type.split('-'))
        license_prefix = ' is licensed under '
        license_str = 'CC ' + ' '.join(license_types) + ' ' + license_ver
    return do_mark_safe(
        '<span class="license">{}<a href="{}">{}</a></span>'
        .format(escape(license_prefix), escape(license_url), escape(license_str))
    )


def jinja_filter_rel_to(link_location, output_location):
    # Convert both to full paths(so from the root to wherever they are)
    # relative to the CWD
    link_path = pathlib.Path(link_location).resolve()
    output_path = pathlib.Path(output_location).resolve()
    if not (output_path.exists() and output_path.is_dir()):
        # Must be a file. We need to be relative to the containing directory.
        output_path = output_path.parent
    return str(link_path.relative_to(output_path))


def jinja_filter_to_readable_timedelta(time, include_millis=False):
    if time is None:
        return '0 seconds'
    if isinstance(time, Undefined):
        return Undefined._fail_with_undefined_error(time)
    if isinstance(time, (int, float)):
        time = datetime.timedelta(seconds=time)
    if not isinstance(time, datetime.timedelta):
        return ago.human(time, past_tense='{}', future_tense='{}')
    else:
        # We almost never want to see the millis
        if not include_millis:
            time = datetime.timedelta(days=time.days, seconds=time.seconds)
        return ago.human(time, past_tense='{}', future_tense='{}')


def create_jinja_env():
    env = Environment(
        loader=PackageLoader('kittens', 'templates'), trim_blocks=True,
        lstrip_blocks=True)
    env.filters['license_html'] = jinja_filter_license_html
    env.filters['rel_to'] = jinja_filter_rel_to
    env.filters['to_readable_timedelta'] = jinja_filter_to_readable_timedelta
    return env


class KittenWriter():

    def __init__(self, version, inline_style=False, use_pickle=False):
        self._version = version
        self._inline_style = inline_style
        self._start_time = None
        self._finish_time = None
        self._photos = []

    @property
    def image_folder(self):
        folder = KITTENS_DIR / self._version
        folder.mkdir(parents=True, exist_ok=True)
        return str(folder)

    def add_all(self, photo_list):
        self._photos += photo_list

    def __enter__(self):
        self._start_time = datetime.datetime.now()
        return self

    def __exit__(self, *a):
        self._finish_time = datetime.datetime.now()
        self.write_out()

    def write_out(self, use_pickle=False):
        vars = self.create_jinja_vars(use_pickle=use_pickle)
        env = create_jinja_env()
        style_template = env.get_template('style.css')
        style_location = KITTENS_DIR / 'stylesheet.css'
        with style_location.open('w') as target:
            style_template.stream(vars).dump(target)
        template = env.get_template('index.html')
        target_file = KITTENS_DIR.joinpath('{}/index.html'.format(self._version))
        vars['output_location'] = target_file.parent
        with target_file.open('w') as target:
            template.stream(vars).dump(target)

        template = env.get_template('slide_inc.css')
        target_file = KITTENS_DIR / 'stylesheet.css'
        vars['output_location'] = target_file.parent
        with target_file.open('w') as target:
            template.stream(vars).dump(target)
        template = env.get_template('slide_inc.html')
        target_file = PRESENTATION_DIR.joinpath('kittens_{}.html'.format(self._version))
        vars['output_location'] = target_file.parent
        with target_file.open('w') as target:
            template.stream(vars).dump(target)

    def create_jinja_vars(self, use_pickle=False, use_json=False):
        image_folder = pathlib.Path(self.image_folder)
        pickle_file = image_folder / 'run.pickle'
        json_file = image_folder / 'run.json'
        vars = None
        if use_json:
            try:
                with json_file.open('r') as jf:
                    vars = json.load(jf)
            except:
                pass
        if use_pickle:
            try:
                with pickle_file.open('rb') as pf:
                    vars = pickle.load(pf)
            except:
                pass
        if vars is None:
            time = per_kitten = 0
            if self._start_time and self._finish_time:
                time = self._finish_time - self._start_time
            if self._photos and time is not None:
                per_kitten = time / len(self._photos)
            vars = dict(
                time=time.total_seconds(),
                per_kitten_time=per_kitten.total_seconds(),
                kittens=self._photos,
            )
        with pickle_file.open('wb') as pf:
            pickle.dump(vars, pf)
        with json_file.open('w') as jf:
            json.dump(vars, jf, indent=2)
        vars['grid'] = 'css'
        vars['inline_style'] = True
        vars['json_location'] = json_file
        vars['pickle_location'] = pickle_file
        return vars


if __name__ == '__main__':
    for folder in KITTENS_DIR.iterdir():
        if not folder.is_dir():
            continue
        if (folder / 'run.pickle').exists():
            print("Unpickling", folder)
            KittenWriter(folder.name).write_out(use_pickle=True)
        else:
            print("No pickle found in", folder)
