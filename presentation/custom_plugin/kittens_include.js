
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

  function getKittenHtml (runId) {
    return fetchCache('kittens_' + runId + '.html')
      .then(function (data) {
        return (new DOMParser()).parseFromString(data, 'text/html')
      })
  }
  function getKittenHtmlById (kittenId) {
    return fetchCache('kittens/individuals/' + kittenId + '.html')
      .then(function (data) {
        return (new DOMParser()).parseFromString(data, 'text/html')
      })
  }
  function getKittenJson (runId, kittenElms) {
    return fetchCache('kittens/' + runId + '/run.json')
      .then(function (data) {
        return JSON.parse(data)
      })
  }
  function getKittenElmFromDom (kittenDom, _opts) {
    const opts = _opts || {}
    const footnote = kittenDom.getElementsByTagName('footnote')[0]
    const div = document.createElement('div')
    const imgTag = kittenDom.getElementsByTagName('img')[0]
    if (!opts.useImg) {
      const url = imgTag.getAttribute('src')
      div.style.backgroundImage = 'url(\'' + url + '\')'
      div.classList.add('kitten-div-img')
    } else {
      div.appendChild(imgTag)
    }
    div.appendChild(footnote)
    return div
  }
  function getKittenElm (kittenId, opts) {
    return getKittenHtmlById(kittenId, opts).then(function (dom) {
      return getKittenElmFromDom(dom, opts)
    })
  }

  function renumberFootnotes (slide, singleSpecial) {
    Footnotes.renumberSlide(slide, function (footnote, idx) {
      if (idx === -1) {
        if (singleSpecial) {
          footnote.removeAttribute('data-footnote-ref')
          const kid = footnote.querySelector('.kitten-id')
          if (kid) {
            kid.innerText = ''
          }
          return
        } else {
          idx = 0
        }
      }
      const humanIdx = (idx + 1)
      const wrapped = '[' + humanIdx + ']'
      footnote.setAttribute('data-footnote-ref', wrapped)
      footnote.querySelector('.kitten-id').innerText = wrapped
    })
  }

  return {
    getKittenHtml: getKittenHtml,
    getKittenJson: getKittenJson,
    getKittenHtmlById: getKittenHtmlById,
    getKittenElmFromDom: getKittenElmFromDom,
    getKittenElm: getKittenElm,

    renumberFootnotes: renumberFootnotes
  }
})()

function _map (arr, fn) {
  return Array.prototype.map.call(arr, fn)
}
(function () {

  Reveal.whenReady(updateFootnotes)
  function updateFootnotes () {
    try {
      Footnotes.renumberSlide
    } catch (e) {
      Reveal.whenReady(updateFootnotes)
    }
    Reveal.getAllSlideIndices().forEach(function (index) {
      const slide = Reveal.getSlide(index.h, index.v)
      if (slide.querySelectorAll('[data-kittens]').length || slide.querySelectorAll('[data-kitten]').length) {
        Kittens.renumberFootnotes(index, true)
      }
    })
  }

  return Promise.all([
    Promise.all(_map(document.querySelectorAll('[data-kittens]'), function (element) {
      const kittenId = element.getAttribute('data-kittens').split(':')[0]
      return htmlKittens(kittenId, element)
    })),
    Promise.all(_map(document.querySelectorAll('[data-kitten]'), function (element) {
      const kittenId = element.getAttribute('data-kitten')
      return Kittens.getKittenElm(kittenId, {useImg: true}).then(function (kittenDiv) {
        element.appendChild(kittenDiv)
      })
    }))
  ])

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
  _forEach(document.querySelectorAll('[data-kitten-data]'), function (element) {
    const kittenData = element.getAttribute('data-kitten-data')
    const kittenId = kittenData.split(':')[0]
    return updateKittenElms(kittenId, element)
  })

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

  let slideBgStore = false

  Reveal.whenReady(createSlideBgs)
  function createSlideBgs () {
    if (slideBgStore === false) {
      slideBgStore = []
      const slides = Reveal.getAllSlides()
      slides.forEach(function (slide, idx) {
        if (slide.hasAttribute('data-background-images')) {
          slideBgStore.push(manageSlide(slide, getImagesFromAttr))
        } else if (slide.hasAttribute('data-background-kitten-run')) {
          slideBgStore.push(manageSlide(slide, getImagesFromKittenRun))
        } else if (slide.hasAttribute('data-background-kittens')) {
          slideBgStore.push(manageSlide(slide, getImagesFromKittenIds))
        }
      })
    }
    slideBgStore.forEach(function (manager) {
      manager.updateSlideDisplays()
      manager.updateTimer()
    })
  }

  function getImagesFromAttr (bg, slide) {
    return _map(slide.getAttribute('data-background-images').split(','), function (url, i) {
      const div = document.createElement('div')
      div.style.zIndex = -100 - i
      div.classList.add('bg-animated-img')
      bg.appendChild(div)
      return div
    })
  }
  function getImagesFromKittenRun (bg, slide) {
    return Kittens.getKittenHtml(slide.getAttribute('data-background-kitten-run')).then(function (kittenHtml) {
      const elms = _map(kittenHtml.querySelectorAll('.kitten-img'), function (kittenDom, i) {
        const div = Kittens.getKittenElmFromDom(kittenDom)
        div.classList.add('bg-animated-img')
        div.classList.add('bg-animated-kitten')
        div.style.zIndex = -100 - i
        bg.appendChild(div)
        return div
      })
      Kittens.renumberFootnotes(slide, true)
      return elms
    })
  }
  function getImagesFromKittenIds (bg, slide) {
    return Promise.all(slide.getAttribute('data-background-kittens').split(',').map(function (kittenId, idx) {
      return Kittens.getKittenElm(kittenId)
        .then(function (div) {
          div.classList.add('bg-animated-img')
          div.classList.add('bg-animated-kitten')
          div.style.zIndex = -100 - idx
          bg.appendChild(div)
          return div
        })
    })).then(function (elms) {
      Kittens.renumberFootnotes(slide, true)
      return elms
    })
  }

  function manageSlide (_slide, getSlideImgs) {
    const indices = Reveal.getIndices(_slide)
    let changerTimer
    let changerIdx
    let changerImgs
    updateSlide()
    return {
      updateSlide: updateSlide,
      updateTimer: updateTimer,
      cancelTimer: cancelTimer,
      updateSlideDisplays: updateSlideDisplays
    }
    function updateSlide () {
      const bg = Reveal.getSlideBackground(indices.h, indices.v)
      const slide = Reveal.getSlide(indices.h, indices.v)
      bg.innerHTML = ''
      cancelTimer()
      changerIdx = 0
      changerImgs = undefined
      Promise.resolve(getSlideImgs(bg, slide)).then(function (res) {
        changerImgs = res
        updateSlideDisplays()
        updateTimer()
      })
    }
    function cancelTimer () {
      if (changerTimer) {
        clearTimeout(changerTimer)
        changerTimer = undefined
      }
    }
    function updateTimer () {
      const state = Reveal.getState()
      cancelTimer()
      if (state.indexh !== indices.h || state.indexv !== indices.v ||
          state.paused || state.overview) {
        console.log('ignoring update.')
        return
      }
      changerTimer = setTimeout(updateTimer, 5000)
      if (changerImgs) {
        updateSlideDisplays()
        changerIdx = (changerIdx + 1) % changerImgs.length
      }
    }
    function updateSlideDisplays () {
      if (!changerImgs) {
        return
      }
      const lastIdx = changerImgs.length - 1
      changerImgs.forEach(function (div, idx) {
        div.classList.remove('bg-past')
        div.classList.remove('bg-current')
        div.classList.remove('bg-future')
        if (idx === changerIdx) {
          div.classList.add('bg-current')
        } else if (changerIdx - 1 === idx || (changerIdx === 0 && idx === lastIdx)) {
          div.classList.add('bg-past')
        } else if (changerIdx + 1 === idx || (changerIdx === lastIdx && idx === 0)) {
          div.classList.add('bg-future')
        }
      })
    }
  }
})()
