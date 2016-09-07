

__api_key = None


def get_api_key():
  global __api_key
  if not __api_key:
    with open('.flickr-key') as key_file:
      __api_key = key_file.read().strip()
  return __api_key
