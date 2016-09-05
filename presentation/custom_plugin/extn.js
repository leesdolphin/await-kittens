
Reveal.getAllSlideIndices = function () {
  let h = 0
  let v = 0
  const res = []
  while (Reveal.getSlide(h, v)) {
    res.push({h: h, v: v})
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
Reveal.getAllSlides = function (fn) {
  return Reveal.getAllSlideIndices().map(function (idx) {
    return Reveal.getSlide(idx.h, idx.v)
  })
}

Reveal.whenReady = function (fn) {
  if (Reveal.isReady()) {
    setTimeout(fn, 1)
    return
  }
  const cb = function () {
    Reveal.removeAllChangeListener(cb)
    fn()
  }
  Reveal.addAllChangeListener(cb)
}

;(function () {
  'use strict'

  const events = ['ready', 'slidechanged', 'fragmentshown', 'fragmenthidden',
                'overviewshown', 'overviewhidden', 'paused', 'resumed']

  Reveal.addAllChangeListener = function (cb) {
    events.forEach(function (evt) {
      Reveal.addEventListener(evt, cb)
    })
  }
  Reveal.removeAllChangeListener = function (cb) {
    events.forEach(function (evt) {
      Reveal.removeEventListener(evt, cb)
    })
  }
}())

function _forEach (arr, fn) {
  return Array.prototype.forEach.call(arr, fn)
}

function _map (arr, fn) {
  return Array.prototype.map.call(arr, fn)
}
