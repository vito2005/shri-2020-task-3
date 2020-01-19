import { sizes, marketingBlocks, getMod } from './helpers'

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

export const textSeveralH1Rule = ({ log, property, type, errors, ast, RuleKeys }:
    {log: any; property: any; type: any, errors: any, ast: any, RuleKeys: any}) => {
  if (property.value.value === 'text') {
    if (type && type.value.value === 'h1') {
      if (log && log.data && log.data.h1) {
        errors.push(
          {
            key: RuleKeys.TextSeveralH1,
            loc: ast.loc
          })
      }
      log.data.h1 = true
    }
  }
}

export const textInvalidH2PositionRule = ({ log, property, type, errors, ast, RuleKeys }:
    {log: any; property: any; type: any, errors: any, ast: any, RuleKeys: any}) => {
  if (property.value.value === 'text') {
    if (type && type.value.value === 'h2') {
      log.data.h2 = ast.loc
    }
    if (type && type.value.value === 'h1' && log.data.h2) {
      errors.push(
        {
          key: RuleKeys.TextInvalidH2Position,
          loc: log.data.h2
        })
    }
  }
}

export const textInvalidH3PositionRule = ({ log, property, type, errors, ast, RuleKeys }:
        {log: any; property: any; type: any, errors: any, ast: any, RuleKeys: any}) => {
  if (property.value.value === 'text') {
    if (type && type.value && type.value.value === 'h3') {
      log.data.h3 = ast.loc
    }
    if (type && type.value.value === 'h2' && log.data && log.data.h3) {
      errors.push(
        {
          key: RuleKeys.TextInvalidH3Position,
          loc: log.data.h3
        })
    }
    if (type && type.value.value === 'h1' && log.data && log.data.h3) {
      errors.push(
        {
          key: RuleKeys.TextInvalidH3Position,
          loc: log.data.h3
        })
    }
  }
}

export const gridTooMuchMarketingBlocksRule = ({ log, property, errors, ast, RuleKeys, gridColumnsValue }:
    {log: any, property: any, errors: any, ast: any, RuleKeys: any, gridColumnsValue?: number}) => {
  if (property.value.value === 'fraction') {
    const content = ast.children && ast.children.find((node: any) => node.key.value === 'content')
    const elemMods = ast.children && ast.children.find((node: any) => node.key.value === 'elemMods')
    const elemModsValue = getMod(elemMods, 'm-col')
    const mColValue = elemModsValue && Number(elemModsValue.value.value)
    const hasMarketingBlock = content.value.children.some((node: any) =>
      node.children.some((node: any) => node.value && marketingBlocks.includes(node.value.value))
    )

    let tooMuchMarketingBlocks

    if (tooMuchMarketingBlocks && log.data.blocks && gridColumnsValue) {
      tooMuchMarketingBlocks = (mColValue + log.data.blocks) / gridColumnsValue > 0.5
    } else if (hasMarketingBlock && gridColumnsValue) {
      tooMuchMarketingBlocks = mColValue / gridColumnsValue > 0.5
    } else if (log.data.blocks) {
      tooMuchMarketingBlocks = gridColumnsValue && log.data.blocks / gridColumnsValue > 0.5
    }

    if (tooMuchMarketingBlocks) {
      errors.push(
        {
          key: RuleKeys.GridTooMuchMarketingBlocks,
          loc: ast.loc
        })
      log.data.blocks = 0
    }

    if (hasMarketingBlock) {
      log.data.blocks = mColValue
    }
  }
}
