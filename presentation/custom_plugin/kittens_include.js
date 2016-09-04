
const Kittens = (function () {  //
  const __cache = {}
  function fetchCache (url) {
    if (__cache[url] === undefined) {
      __cache[url] = window
        .fetch(url, {mode: 'no-cors', credentials: 'omit'})
        .then(function (resp) {
          if (!resp.ok) {
            throw new Error(resp)
          }
          return resp
        })
        .then(function (response) {
          return response.text()
        })
    }
    return __cache[url]
  }

  function getKittenHtml (kittenId) {
    return fetchCache('kittens_' + kittenId + '.html')
      .then(function (data) {
        return (new DOMParser()).parseFromString(data, 'text/html')
      })
  }
  function getKittenJson (kittenId, kittenElms) {
    return fetchCache('kittens/' + kittenId + '/run.json')
      .then(function (data) {
        return JSON.parse(data)
      })
  }
  return {
    getKittenHtml: getKittenHtml,
    getKittenJson: getKittenJson
  }
})()

function map (arr, fn) {
  return Array.prototype.map.call(arr, fn)
}
(function () {
  return Promise.all(map(document.querySelectorAll('[data-kittens]'), function (element) {
    const kittenId = element.getAttribute('data-kittens').split(':')[0]
    return htmlKittens(kittenId, element)
  }))

  function htmlKittens (kittenId, kittenElm) {
    return Kittens.getKittenHtml(kittenId)
      .then(function (doc) {
        const content = doc.querySelector('.kitten-pinwheel')
        const slides = document.querySelector('.reveal .slides')
        content.style.width = slides.style.width
        content.style.height = slides.style.height

        const time = doc.querySelector('.kitten-time')
        const tmp = document.createElement('span')
        tmp.innerHTML = time.outerHTML.trim()
        const fragmentChild = tmp.firstChild
        fragmentChild.classList.add('fragment')
        if (kittenElm.hasAttribute('data-kitten-time')) {
          kittenElm.innerHTML = tmp.innerHTML
        } else {
          const types = kittenElm.getAttribute('data-kittens').split(':')[1]
          kittenElm.innerHTML = content.outerHTML.trim()
          if (!types || types.indexOf('no-time') === -1) {
            kittenElm.parentNode.insertBefore(fragmentChild, kittenElm)
          }
        }
      })
  }
})();

(function () {
  return Promise.all(map(document.querySelectorAll('[data-kitten-data]'), function (element) {
    const kittenData = element.getAttribute('data-kitten-data')
    const kittenId = kittenData.split(':')[0]
    return updateKittenElms(kittenId, element)
  }))

  function updateKittenElms (kittenId, kittenElm) {
    return Kittens.getKittenJson(kittenId)
      .then(function (data) {
        const key = kittenElm.getAttribute('data-kitten-data').split(':')[1]
        kittenElm.innerText = parse(data, key)
      })
  }

  function parse (data, key) {
    if (key === 'time') {
      return parseTime(data['time'])
    } else if (key === 'kitten-time' || key === 'per-time') {
      return parseTime(data['per_kitten_time'])
    }
  }
  function parseTime (rawTime) {
    const time = Math.round(rawTime * 10) / 10
    return time + ' seconds'
  }
})()
