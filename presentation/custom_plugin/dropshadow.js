
(function () {
  const shadowNodes = document.querySelectorAll('[data-dropshadow]')
  for (let i = 0, len = shadowNodes.length; i < len; i++) {
    const element = shadowNodes[i]
    const shadow = element.getAttribute('data-dropshadow') || ''
    let shadowWidth = '3px'
    let shadowHeight = '3px'
    let shadowRadius = '5px'
    let shadowColour = 'rgba(220, 220, 220, 0.4)'
    try {
      const shadowParts = JSON.parse(shadow)
      shadowWidth = shadowParts.w || shadowParts.width || shadowWidth
      shadowHeight = shadowParts.h || shadowParts.height || shadowHeight
      shadowRadius = shadowParts.r || shadowParts.radius || shadowRadius
      shadowColour = shadowParts.c || shadowParts.colour || shadowParts.color || shadowColour
    } catch (e) {
      // noop
    }
    const neShadow = ['-' + shadowWidth, '-' + shadowHeight, shadowRadius, shadowColour].join(' ')
    const nwShadow = [shadowWidth, '-' + shadowHeight, shadowRadius, shadowColour].join(' ')
    const seShadow = ['-' + shadowWidth, shadowHeight, shadowRadius, shadowColour].join(' ')
    const swShadow = [shadowWidth, shadowHeight, shadowRadius, shadowColour].join(' ')
    element.style.textShadow = [neShadow, nwShadow, seShadow, swShadow].join(',')
  }
})()
