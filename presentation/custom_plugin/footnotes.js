(function () {
  var footnote_placeholders = {};
  var footnoteSlides = {}
  var getId = (function () {
      var num = 0;
      return function () {
        var idx = Reveal.getIndices()
        var slide = 'slide' + idx.h + ':' + idx.v + ':' + (idx.f || '?')
        return slide + ' -- ' + (num++)
      }
  })()

  var getAllSlideFootnotes = function (slide) {
    slide = slide || Reveal.getIndices()
    var id = 'slide' + slide.h + ':' + slide.v
    var all = []
    if (footnoteSlides[id]) {
      Array.prototype.push.apply(all, footnoteSlides[id])
    }

    forEach(Reveal.getCurrentSlide().getElementsByTagName('footnote'), function (elm) {
      if (all.indexOf(elm)) {
        all.push(elm);
      }
    });
    console.log(all)
    footnoteSlides[id] = all
    return all
  }


  var forEach = function(arr, fn) {
    Array.prototype.forEach.call(arr, fn)
  }

  var attrs = function (elm) {
    var attrs = {}
    forEach(elm.attributes, function (attr) {
      attrs[attr.name] = attr.value
    })
    return attrs
  }

  var rem_cb = (function () {
    num = 0;
    footnoteEventListeners = {}
    return function (footnote) {
      console.log('prerm', attrs(footnote))
      var footnoteId = footnote.getAttribute('data-footnote-id')
      if (footnoteEventListeners[footnoteId]) {
        if (footnote.getAttribute('data-footnote-removing') === footnoteEventListeners[footnoteId].id) {
          return
        } else {
          footnote.removeEventListener('transitionend', footnoteEventListeners[footnoteId].cb, {once: true, passive: true})
          delete footnoteEventListeners[footnoteId]
        }
      }
      var rmNum = 'rmNum - ' + (num++)
      footnote.setAttribute('data-footnote-removing', rmNum)
      console.log('preanimaterm', attrs(footnote))
      footnoteEventListeners[footnoteId] = {id: rmNum, cb: rm}
      footnote.addEventListener('transitionend', rm, {once: true, passive: true})
      footnote.classList.add('hidden');
      function rm () {
        console.log('postanimaterm', rmNum, footnote.getAttribute('data-footnote-removing') !== rmNum, attrs(footnote))
        if (footnote.getAttribute('data-footnote-removing') !== rmNum) {
          return
        }
        delete footnoteEventListeners[footnoteId]
        footnote.removeAttribute('data-footnote-removing')
        footnote.remove()
        if (footnoteId) {
          var placeholder = footnote_placeholders[footnoteId]
          delete footnote_placeholders[footnoteId];
          placeholder.parentNode.replaceChild(footnote, placeholder)
        }
        console.log('postrm', attrs(footnote))
      }
    }
  })()

  function updateSlides() {
    console.log("UPDATE SLIDES", Reveal.getState())
    var holder = document.querySelector('#footnote-holder')
    forEach(holder.getElementsByTagName('footnote'), rem_cb)
    var currentSlide = Reveal.getCurrentSlide()
    getAllSlideFootnotes().forEach(function (footnote) {
      console.log('preadd', attrs(footnote))
      footnote.removeAttribute('data-footnote-removing')
      footnote.classList.add('hidden')
      if (!footnote.getAttribute('data-footnote-id')) {
        footnote.setAttribute('data-footnote-id', getId())
      }
      var footnoteId = footnote.getAttribute('data-footnote-id')
      placeholder = document.createElement('span')
      placeholder.style.display = 'none'
      placeholder.setAttribute('data-placeholder-for', footnoteId)
      footnote.parentNode.replaceChild(placeholder, footnote)
      footnote_placeholders[footnoteId] = placeholder
      holder.appendChild(footnote)
      console.log('postadd', attrs(footnote))
      footnote.classList.remove('hidden')
      console.log('postanimadd', attrs(footnote))
    })


  }
  Reveal.addEventListener( 'slidechanged', function( event ) {
    updateSlides();
  });
  updateSlides();
})();
