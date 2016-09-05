const Footnotes = (function () {
  function getFootnoteId (slideIndices, footnoteNum) {
    return getSlideId(slideIndices) + '-' + footnoteNum
  }
  function getSlideId (slideIndices) {
    return 'slide' + slideIndices.h + '-' + slideIndices.v
  }

  function getAllSlideFootnotes (slideIndices) {
    const indices = slideIndices || Reveal.getIndices()
    const all = []
    const bg = Reveal.getSlideBackground(indices.h, indices.v)
    if (bg) {
      _forEach(bg.getElementsByTagName('footnote'), function (elm) {
        all.push(elm)
      })
    }
    _forEach(Reveal.getSlide(indices.h, indices.v).getElementsByTagName('footnote'), function (elm) {
      all.push(elm)
    })
    return all
  }

  function renumberSlide (slideOrIdxes, applyFn) {
    let slide
    let indices
    if (slideOrIdxes) {
      try {
        document.contains(slideOrIdxes)
        slide = slideOrIdxes
        indices = Reveal.getIndices(slide)
      } catch (e) {
        indices = slideOrIdxes
        slide = Reveal.getSlide(indices.h, indices.v)
      }
    } else {
      slide = Reveal.getCurrentSlide()
      indices = Reveal.getIndices()
    }
    returnAllFootnotes(document.querySelector('#footnote-holder'))
    const allFootnotes = getAllSlideFootnotes(indices)
    if (allFootnotes.length === 1) {
      applyFn(allFootnotes[0], -1)
    } else {
      allFootnotes.forEach(applyFn)
    }
    updateSlides()
  }

  function returnAllFootnotes (holder) {
    while (holder.firstChild) {
      const footnote = holder.firstChild
      if (footnote.hasAttribute('data-footnote-id')) {
        const footnoteId = footnote.getAttribute('data-footnote-id')
        const placeholder = document.getElementById('footnote-placeholder-' + footnoteId)
        if (placeholder) {
          placeholder.parentNode.replaceChild(footnote, placeholder)
          continue
        }
      }
      holder.removeChild(footnote)
    }
  }

  function distributeFootnotesForSlide (slideIndices, holder) {
    getAllSlideFootnotes(slideIndices).forEach(function (footnote, idx) {
      const footnoteId = getFootnoteId(slideIndices, idx)
      const fnId = 'footnote-' + footnoteId
      const plId = 'footnote-placeholder-' + footnoteId
      footnote.id = fnId
      footnote.setAttribute('data-footnote-id', footnoteId)
      const placeholder = document.getElementById(plId) || document.createElement('span')
      placeholder.setAttribute('data-placeholder-for', footnoteId)
      placeholder.id = plId
      const footnoteRef = footnote.getAttribute('data-footnote-ref')
      if (footnoteRef) {
        placeholder.classList.add('footnote-ref')
        placeholder.innerText = footnoteRef
        placeholder.style.display = ''
      } else {
        placeholder.classList.remove('footnote-ref')
        placeholder.innerText = ''
        placeholder.style.display = 'none'
      }
      footnote.parentNode.replaceChild(placeholder, footnote)
      holder.appendChild(footnote)
    })
  }

  function updateSlides () {
    const holder = document.querySelector('#footnote-holder')
    returnAllFootnotes(holder)
    distributeFootnotesForSlide(Reveal.getIndices(), holder)
    Reveal.layout()
  }
  
  Reveal.whenReady(function () {
    updateSlides();
    Reveal.addAllChangeListener(updateSlides)
  })
  return {
    renumberSlide: renumberSlide,
    updateSlides: updateSlides
  }
})()
