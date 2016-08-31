(function () {
  function map (arr, fn) {
    return Array.prototype.map.call(arr, fn)
  }
  function forEach (arr, fn) {
    return Array.prototype.forEach.call(arr, fn)
  }
  forEach(document.querySelectorAll('[data-mark]'), function (element) {
    let fragCounter = 1
    const re = /<\/?(mark|add|rm|fragment)>(.*?)<\/\1>/gim
    const str = element.innerHTML
    let lastEnd = 0
    element.innerHTML = ''
    for (let match = re.exec(str); match !== null; match = re.exec(str)) {
      const matchStart = re.lastIndex - match[0].length
      const before = str.substring(lastEnd, matchStart)
      const type = match[1]
      const content = match[2]
      if (before) {
        element.appendChild(document.createTextNode(before))
      }
      if (content) {
        const contentElm = document.createTextNode(content)
        const markSpan = document.createElement('span')
        markSpan.appendChild(contentElm)
        markSpan.classList.add('code-mark')
        markSpan.classList.add('code-mark-' + type)
        if (type === 'fragment') {
          markSpan.classList.add('fragment')
          markSpan.setAttribute('data-fragment-index', fragCounter++)
        }
        element.appendChild(markSpan)
      }
      lastEnd = re.lastIndex
    }
    const after = str.substring(lastEnd)
    if (after) {
      element.appendChild(document.createTextNode(after))
    }
    element.setAttribute('data-noescape', true)
  })
})()
