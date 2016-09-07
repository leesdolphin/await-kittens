
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
    const div = document.createElement('div')
    const imgTag = kittenDom.getElementsByTagName('img')[0]
    if (!opts.useImg) {
      const url = imgTag.getAttribute('src')
      div.style.backgroundImage = 'url(\'' + url + '\')'
      div.classList.add('kitten-div-img')
    } else {
      div.appendChild(imgTag)
    }
    if (!opts.excludeFootnote) {
      const footnote = kittenDom.getElementsByTagName('footnote')[0]
      div.appendChild(footnote)
    }
    if (opts.useImg && div.children.length === 1) {
      return div.children[0]
    }
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

  function getAllKittens (_opts) {
    return fetchCache('kittens/individuals/images.json')
      .then(function (_all) {
        return JSON.parse(_all)
      })
  }

  return {
    getKittenHtml: getKittenHtml,
    getKittenJson: getKittenJson,
    getKittenHtmlById: getKittenHtmlById,
    getKittenElmFromDom: getKittenElmFromDom,
    getKittenElm: getKittenElm,
    getAllKittens: getAllKittens,

    renumberFootnotes: renumberFootnotes
  }
})()

function _map (arr, fn) {
  return Array.prototype.map.call(arr, fn)
}
(function () {
  Reveal.whenReady(updateFootnotes)
  function updateFootnotes (forceRelayout) {
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
    if (forceRelayout) {
      Reveal.layout()
    }
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
  ]).then(function () {
    Reveal.whenReady(function () {
      updateFootnotes(true)
    })
  })

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
  });
  // (function () {
  //   'use strict'
  //   const allKittenSlides = document.querySelectorAll('[data-all-kittens]')
  //   if (!allKittenSlides) {
  //     return
  //   }
  //   const kittenInfo = []
  //   Kittens.getAllKittens().then(function (allKittens) {
  //     Object.keys(allKittens).forEach(function (kittenId) {
  //       const kitten = allKittens[kittenId]
  //       let path = kitten['image_relative_path']
  //       if (path.startsWith('presentation/')) {
  //         path = path.substring('presentation/'.length)
  //       }
  //       kittenInfo.push({
  //         'height': kitten['height'],
  //         'width': kitten['width'],
  //         'imagePath': path
  //       })
  //     })
  //   }).then(function () {
  //     // Reveal.whenReady(function () {
  //     //   _forEach(allKittenSlides, function (slide) {
  //     //     const idxes = Reveal.getIndices(slide)
  //     //     const bg = Reveal.getSlideBackground(idxes.h, idxes.v)
  //     //     bg.style.paddingTop = '100px'
  //     //     const container = document.createElement('div')
  //     //     container.classList.add('multi-kitten')
  //     //     bg.appendChild(container)
  //     //
  //     //     window.addEventListener('resize', function () {
  //     //       setTimeout(updateWidths, 2)
  //     //     })
  //     //     container.addEventListener('transitionend', animate, {passive: true})
  //     //
  //     //     let width
  //     //     let cols
  //     //     let colWidth
  //     //     const animMovement = 500
  //     //     const colOffsets = []
  //     //     let oldOffsets = []
  //     //     const colItems = []
  //     //
  //     //     updateWidths()
  //     //     animate()
  //     //
  //     //     function diffOffsets (name) {
  //     //       let diff = false
  //     //       if (colOffsets.length === oldOffsets.length) {
  //     //         colOffsets.forEach(function (val, idx) {
  //     //           diff = diff || (oldOffsets[idx] !== val)
  //     //         })
  //     //       } else {
  //     //         diff = true
  //     //       }
  //     //       if (diff) {
  //     //         console.log(name, oldOffsets, colOffsets)
  //     //       }
  //     //       oldOffsets = colOffsets.slice()
  //     //     }
  //     //
  //     //     function nextCol () {
  //     //       let minVal = Infinity
  //     //       let minIdx = 0
  //     //       if (colOffsets.length !== cols) {
  //     //         return colOffsets.length
  //     //       }
  //     //       colOffsets.forEach(function (val, idx) {
  //     //         if (val < minVal) {
  //     //           minIdx = idx
  //     //           minVal = val
  //     //         }
  //     //       })
  //     //       return minIdx
  //     //     }
  //     //
  //     //     function updateWidths () {
  //     //       const newWidth = bg.clientWidth
  //     //       const newCols = Math.ceil(newWidth / 400)
  //     //       diffOffsets('updateWidths')
  //     //       if (newWidth === width) {
  //     //         return
  //     //       } else if (newCols === cols) {
  //     //         width = newWidth
  //     //         colWidth = Math.round(width / cols)
  //     //         adjustItems()
  //     //       } else {
  //     //         width = newWidth
  //     //         cols = newCols
  //     //         colWidth = Math.round(width / cols)
  //     //         colItems.forEach(function (imgTags, thisCol) {
  //     //           imgTags.forEach(function (imgTag) {
  //     //             imgTag.parentElement.removeChild(imgTag)
  //     //           })
  //     //         })
  //     //         colItems.splice(0)
  //     //         colOffsets.splice(0)
  //     //         colOffsets.fill(0, 0, cols)
  //     //       }
  //     //       diffOffsets('updateWidths')
  //     //       increaseLayout()
  //     //       diffOffsets('updateWidths')
  //     //     }
  //     //
  //     //     function adjustItems () {
  //     //       // Adjust item Width/Height. Then increaseLayout
  //     //       diffOffsets('adjustItems')
  //     //       colItems.forEach(function (imgTags, thisCol) {
  //     //         colOffsets[thisCol] = imgTags[0].offsetTop
  //     //         imgTags.forEach(function (imgTag) {
  //     //           const idx = imgTag.getAttribute('data-id')
  //     //           const info = kittenInfo[idx]
  //     //           putImgInCol(info, thisCol, imgTag)
  //     //         })
  //     //       })
  //     //       diffOffsets('adjustItems')
  //     //     }
  //     //
  //     //     function putImgInCol (info, thisCol, imgTag) {
  //     //       const vOffset = colOffsets[thisCol] || 0
  //     //       const wRatio = colWidth / info.width
  //     //       const height = Math.round(info.height * wRatio)
  //     //       imgTag.style.width = colWidth + 'px'
  //     //       imgTag.style.height = height + 'px'
  //     //       imgTag.style.left = (thisCol * colWidth) + 'px'
  //     //       imgTag.style.top = vOffset + 'px'
  //     //       colOffsets[thisCol] = vOffset + height
  //     //     }
  //     //
  //     //     function removeOutOfView () {
  //     //       diffOffsets('removeOutOfView')
  //     //       const oldTop = container.offsetTop // Negative
  //     //       colItems.forEach(function (imgTags, thisCol) {
  //     //         let removed = 0
  //     //         imgTags.slice().forEach(function (imgTag, oldIdx) {
  //     //           const newTop = imgTag.offsetTop + oldTop
  //     //           const bottom = (newTop + imgTag.offsetHeight)
  //     //           if (!imgTag.parentElement) {
  //     //             imgTags.pop(oldIdx - removed)
  //     //             removed++
  //     //             return
  //     //           } else if (bottom < 0) {
  //     //             imgTags.pop(oldIdx - removed)
  //     //             if (imgTag.parentElement) {
  //     //               imgTag.parentElement.removeChild(imgTag)
  //     //             }
  //     //             removed++
  //     //           }
  //     //         })
  //     //       })
  //     //       diffOffsets('removeOutOfView')
  //     //     }
  //     //
  //     //     function animate () {
  //     //       diffOffsets('animate')
  //     //       removeOutOfView()
  //     //       diffOffsets('animate')
  //     //       increaseLayout()
  //     //       diffOffsets('animate')
  //     //       container.style.transitionProperty = 'none'
  //     //       setTimeout(function () {
  //     //         container.style.transitionDuration = '10s'
  //     //         container.style.transitionTimingFunction = 'linear'
  //     //         container.style.transitionProperty = 'top'
  //     //         container.style.top = (container.offsetTop - animMovement) + 'px'
  //     //       }, 1)
  //     //     }
  //     //
  //     //     function increaseLayout () {
  //     //       diffOffsets('increaseLayout')
  //     //       const minHeight = bg.offsetHeight + (animMovement * 2) - container.offsetTop
  //     //       while ((colOffsets[nextCol()] || 0) < minHeight) {
  //     //         kittenInfo.forEach(function (info, idx) {
  //     //           const thisCol = nextCol()
  //     //           colItems[thisCol] = (colItems[thisCol] || [])
  //     //           const imgTag = document.createElement('img')
  //     //           imgTag.setAttribute('src', info.imagePath)
  //     //           imgTag.setAttribute('data-id', idx)
  //     //           putImgInCol(info, thisCol, imgTag)
  //     //           colItems[thisCol].push(imgTag)
  //     //           container.appendChild(imgTag)
  //     //         })
  //     //         diffOffsets('increaseLayout')
  //     //       }
  //     //     }
  //     //   })
  //     // })
  //   })
  // }());

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

  const slideBgStore = []

  Reveal.whenReady(createSlideBgs)
  function createSlideBgs () {
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

  Reveal.addAllChangeListener(function () {
    slideBgStore.forEach(function (manager) {
      manager.updateTimer(true)
    })
  })

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
      return Kittens.getKittenElm(kittenId.trim())
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
        res[0].classList.add('bg-current')
        changerImgs = res
        updateSlideDisplays()
        updateTimer(true)
      })
    }
    function cancelTimer () {
      if (changerTimer) {
        clearInterval(changerTimer)
        changerTimer = undefined
      }
    }
    function updateTimer (restartOnly) {
      const state = Reveal.getState()
      if (state.indexh !== indices.h || state.indexv !== indices.v ||
          state.paused || state.overview) {
        cancelTimer()
        updateSlideDisplays()
        return
      }
      if (changerTimer && restartOnly) {
        return
        // Noop.
      } else if (!changerTimer) {
        changerTimer = setInterval(updateTimer, 5000)
      }
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
