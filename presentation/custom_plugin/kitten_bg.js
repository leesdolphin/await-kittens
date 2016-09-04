(function () {
  function forAllIndicies (fn) {
    let h = 0
    let v = 0
    const res = []
    while (Reveal.getSlide(h, v)) {
      res.push(fn(h, v))
      if (Reveal.getSlide(h, v) === Reveal.getSlide(h, v + 1) ||
          Reveal.getSlide(h, v + 1) === undefined) {
        // End of stack
        h++
        v = 0
      } else {
        v++
      }
    }
    return res
  }

  let slideBgStore = false

  function createSlideBgs () {
    if (slideBgStore === false) {
      slideBgStore = []
      const slides = forAllIndicies(Reveal.getSlide)
      slides.forEach(function (slide, idx) {
        if (slide.hasAttribute('data-background-images')) {
          slideBgStore.push(manageSlide(slide, getImagesFromAttr))
        } else if (slide.hasAttribute('data-background-kittens')) {
          slideBgStore.push(manageSlide(slide, getImagesFromKitten))
        }
      })
    }
    slideBgStore.forEach(function (manager) {
      manager.updateSlideDisplays()
      manager.updateTimer()
    })
  }
  ['ready', 'slidechanged', 'overviewshown', 'overviewhidden', 'paused', 'resumed'].forEach(function (evt) {
    Reveal.addEventListener(evt, function (event) {
      createSlideBgs()
    })
  })

  function map (arr, fn) {
    return Array.prototype.map.call(arr, fn)
  }

  function getImagesFromAttr (bg, slide) {
    return map(slide.getAttribute('data-background-images').split(','), function (url, i) {
      const div = document.createElement('div')
      div.style.backgroundImage = 'url(\'' + url + '\')'
      div.style.zIndex = -100 - i
      div.classList.add('bg-animated-img')
      bg.appendChild(div)
      return div
    })
  }
  function getImagesFromKitten (bg, slide) {
    return Kittens.getKittenHtml(slide.getAttribute('data-background-kittens')).then(function (kittenHtml) {
      return map(kittenHtml.querySelectorAll('.kitten-img'), function (kitten, i) {
        const footnote = kitten.getElementsByTagName('footnote')[0]
        const url = kitten.getElementsByTagName('img')[0].getAttribute('src')
        const div = document.createElement('div')
        div.style.backgroundImage = 'url(\'' + url + '\')'
        div.style.zIndex = -100 - i
        div.classList.add('bg-animated-img')
        div.classList.add('bg-animated-kitten')
        div.appendChild(footnote)
        bg.appendChild(div)
        return div
      })
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
