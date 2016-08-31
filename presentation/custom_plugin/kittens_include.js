(function () {
  function map (arr, fn) {
    return Array.prototype.map.call(arr, fn)
  }
  function forEach (arr, fn) {
    return Array.prototype.forEach.call(arr, fn)
  }
  const kittenNodes = document.querySelectorAll('[data-kittens]')
  const kittenIds = {}
  forEach(kittenNodes, function (element) {
    const kittenId = element.getAttribute('data-kittens');
    (kittenIds[kittenId] = kittenIds[kittenId] || []).push(element)
  })

  return Promise.all(map(Object.keys(kittenIds), function (kittenId) {
    const kittenElms = kittenIds[kittenId]
    return htmlKittens(kittenId, kittenElms)
  }))

  function htmlKittens (kittenId, kittenElms) {
    return window
      .fetch('kittens_' + kittenId + '.html', {mode: 'no-cors', credentials: 'omit'})
      .then(function (response) {
        return response.text()
      })
      .then(function (data) {
        const doc = (new DOMParser()).parseFromString(data, 'text/html')
        const content = doc.querySelector('.kitten-pinwheel')
        const time = doc.querySelector('.kitten-time')
        const slides = document.querySelector('.reveal .slides')
        content.style.width = slides.style.width
        content.style.height = slides.style.height
        return Promise.all(kittenElms.map(function (elm) {
          elm.innerHTML = content.outerHTML.trim()
          const tmp = document.createElement('span')
          tmp.innerHTML = time.outerHTML.trim()
          const fragmentChild = tmp.firstChild
          fragmentChild.classList.add('fragment')
          elm.parentNode.insertBefore(fragmentChild, elm)
        }))
      })
  }
})()
