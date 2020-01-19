import { sizes } from './helpers'

export const warningButtonSizeRule = ({ log, property, size, errors, ast, RuleKeys }:
     {log: any; property: any; size: any, errors: any, ast: any, RuleKeys: any}) => {
  const { buttonSize } = log.data

  if ((property.value.value === 'text' || property.value.value === 'placeholder') && !buttonSize && size) {
    log.data.buttonSize = sizes[sizes.findIndex(s => s === size.value.value) + 1]
  }

  if (property.value.value === 'button' && buttonSize && buttonSize !== size.value.value) {
    errors.push(
      {
        key: RuleKeys.WarningButtonSize,
        loc: ast.loc
      })
  }
}

export const warningButtonPositionRule = ({ log, property, errors, ast, RuleKeys }:
    {log: any; property: any; errors: any, ast: any, RuleKeys: any}) => {
  if (property.value.value === 'button') {
    log.data.buttonPosition = ast.loc
  }

  if (property.value.value === 'placeholder' && log.data.buttonPosition) {
    errors.push(
      {
        key: RuleKeys.WarningButtonPosition,
        loc: log.data.buttonPosition
      })
  }
}

export const warningPlaceholderSizeRule = ({ property, size, errors, ast, RuleKeys }:
    {log: any; property: any; size: any, errors: any, ast: any, RuleKeys: any}) => {
  if (property.value.value === 'placeholder') {
    if (size && !['s', 'm', 'l'].includes(size.value.value)) {
      errors.push(
        {
          key: RuleKeys.WarningPlaceholderSize,
          loc: ast.loc
        })
    }
  }
}

export const warningTextSizesRule = ({ log, property, size, errors, ast, RuleKeys }:
    {log: any; property: any; size: any, errors: any, ast: any, RuleKeys: any}) => {
  if (property.value.value === 'text') {
    if (!log.data.textSize && size && size.value && size.value.value) {
      log.data.textSize = size.value.value
      log.loc = ast.loc
    }
    if (size && size.value && log.data.textSize && size.value.value !== log.data.textSize) {
      errors.push(
        {
          key: RuleKeys.WarningTextSizes,
          loc: log.loc
        })
    }
  }
}
