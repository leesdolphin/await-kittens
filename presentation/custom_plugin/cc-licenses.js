(function () {
  const shadow_nodes = document.querySelectorAll('[data-cc]')
  for (let i = 0, len = shadow_nodes.length; i < len; i++) {
    const element = shadow_nodes[i]
    const license_info = element.getAttribute('data-cc').split('/')
    const license_type = license_info[0]
    const license_ver = license_info[1]
    const a_tag = document.createElement('a')
    a_tag.setAttribute('href', 'https://creativecommons.org/licenses/' + license_type + '/' + license_ver + '/')
    a_tag.setAttribute('target', '_blank')
    const types = license_type.split('-').map(function (str) { return str.toUpperCase() })
    a_tag.innerText = 'CC ' + types.join(' ') + ' ' + license_ver
    element.appendChild(a_tag)
  }
})()
