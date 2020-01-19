const defaultThemeClassName = 'theme_color_project-default'
const inverseThemeClassName = 'theme_color_project-inverse'
const accordionContainerClassName = 'history__transaction'
const hideElementClassName = 'history__hide'

function switchTheme () {
  const defaultTheme = document.querySelectorAll(`.${defaultThemeClassName}`)
  const inverseTheme = document.querySelectorAll(`.${inverseThemeClassName}`);

  [...defaultTheme, ...inverseTheme].forEach(element => {
    element.classList.toggle(defaultThemeClassName)
    element.classList.toggle(inverseThemeClassName)
  })
}

function toggleAccordion () {
  const findNode = node => {
    if (!node || !node.className) {
      return
    }

    if (node.className.includes(accordionContainerClassName)) {
      const additionalElement = node.querySelector(`.${hideElementClassName}`)

      if (window.getComputedStyle(additionalElement).display === 'none') {
        additionalElement.style.display = 'flex'
      } else {
        additionalElement.style.display = 'none'
      }

      return
    }

    return findNode(node.parentNode)
  }

  findNode(event.target)
}

function router (event) {
  toggleAccordion()

  if (event.target.className === 'onoffswitch__button') {
    switchTheme()
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const onoffswitch = document.querySelector('body')

  onoffswitch.addEventListener('click', router)
})
