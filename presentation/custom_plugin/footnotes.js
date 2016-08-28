(function () {
  const footnotePlaceholders = {}
  const footnoteEventListeners = {}
  const footnoteSlides = {}
  let num = 0
  const getId = (function () {
    let num = 0
    return function () {
      const idx = Reveal.getIndices()
      const slide = 'slide' + idx.h + ':' + idx.v + ':' + (idx.f || '?')
      return slide + ' -- ' + (num++)
    }
  })()

  const getAllSlideFootnotes = function (slide) {
    slide = slide || Reveal.getIndices()
    const id = 'slide' + slide.h + ':' + slide.v
    const all = []
    if (footnoteSlides[id]) {
      Array.prototype.push.apply(all, footnoteSlides[id])
    }

    forEach(Reveal.getCurrentSlide().getElementsByTagName('footnote'), function (elm) {
      if (all.indexOf(elm) === -1) {
        all.push(elm)
      }
    })
    footnoteSlides[id] = all
    return all
  }

  const forEach = function (arr, fn) {
    Array.prototype.forEach.call(arr, fn)
  }

  function rmNow (footnote) {
    const footnoteId = footnote.getAttribute('data-footnote-id')
    if (footnoteEventListeners[footnoteId]) {
      footnote.removeEventListener('transitionend', footnoteEventListeners[footnoteId].cb, {once: true, passive: true})
      delete footnoteEventListeners[footnoteId]
    }
    footnote.removeAttribute('data-footnote-removing')
    footnote.remove()
    if (footnoteId) {
      const placeholder = footnotePlaceholders[footnoteId]
      if (placeholder.parentNode) {
        const parent = placeholder.parentNode
        parent.replaceChild(footnote, placeholder)
      }
      placeholder.remove()
    }
  }

  const remCb = (function () {
    return function (footnote) {
      if (footnote.tagName !== 'FOOTNOTE') {
        footnote.remove()
        return
      }
      const footnoteId = footnote.getAttribute('data-footnote-id')
      if (footnoteEventListeners[footnoteId]) {
        if (footnote.getAttribute('data-footnote-removing') === footnoteEventListeners[footnoteId].id) {
          return
        } else {
          footnote.removeEventListener('transitionend', footnoteEventListeners[footnoteId].cb, {once: true, passive: true})
          delete footnoteEventListeners[footnoteId]
        }
      }
      const rmNum = 'rmNum - ' + (num++)
      footnote.setAttribute('data-footnote-removing', rmNum)
      footnoteEventListeners[footnoteId] = {id: rmNum, cb: rm}
      footnote.addEventListener('transitionend', rm, {once: true, passive: true})
      footnote.classList.add('hidden')
      function rm () {
        rmNow(footnote)
      }
    }
  })()

  function updateSlides () {
    const holder = document.querySelector('#footnote-holder')
    forEach(holder.children, remCb)
    getAllSlideFootnotes().forEach(function (footnote) {
      footnote.removeAttribute('data-footnote-removing')
      footnote.classList.add('hidden')
      if (!footnote.getAttribute('data-footnote-id')) {
        footnote.setAttribute('data-footnote-id', getId())
      }
      const footnoteId = footnote.getAttribute('data-footnote-id')
      const footnoteRef = footnote.getAttribute('data-footnote-ref')
      const placeholder = footnotePlaceholders[footnoteId] || document.createElement('span')
      if (!footnotePlaceholders[footnoteId]) {
        placeholder.setAttribute('data-placeholder-for', footnoteId)
        if (footnoteRef) {
          placeholder.classList.add('footnote-ref')
          placeholder.innerText = footnoteRef
        } else {
          placeholder.style.display = 'none'
        }
        footnotePlaceholders[footnoteId] = placeholder
      }
      if (placeholder.parentNode) {
        rmNow(footnote)
      }
      footnote.parentNode.replaceChild(placeholder, footnote)
      footnotePlaceholders[footnoteId] = placeholder
      holder.appendChild(footnote)
      footnote.classList.remove('hidden')
    })
    Reveal.layout()
  }
  Reveal.addEventListener('slidechanged', function (event) {
    updateSlides()
  })
  Reveal.sync = (function (oldSync) {
    return function () {
      updateSlides()
      oldSync()
    }
  })(Reveal.sync)
  updateSlides()
})()
