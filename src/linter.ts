import * as jsonToAst from 'json-to-ast'
import { getMod } from './helpers'

export type JsonAST = jsonToAst.AstJsonEntity | undefined;

export interface LinterProblem<TKey> {
    key: TKey;
    loc: jsonToAst.AstLocation;
}

export function makeLint<TProblemKey> (
  json: string,
  validateProperty: (property: jsonToAst.AstProperty,
     isWarningBlock: boolean,
      log: any,
       mods: any,
        ast: jsonToAst.AstJsonEntity,
        gridColumnsValue?: number) => LinterProblem<TProblemKey>[],
  validateObject: (property: jsonToAst.AstObject) => LinterProblem<TProblemKey>[]
): LinterProblem<TProblemKey>[] {
  function walk (
    node: jsonToAst.AstJsonEntity,
    cbProp: (property: jsonToAst.AstProperty, isWarningBlock: boolean, mods: any, ast: jsonToAst.AstJsonEntity, gridColumnsValue?: number) => void,
    cbObj: (property: jsonToAst.AstObject) => void,
    warningBlock: boolean = false,
    gridColumnsValue?: number
  ) {
    let mods: any
    let sizeOfColumns: any
    switch (node.type) {
      case 'Array':
        node.children.forEach((item: jsonToAst.AstJsonEntity) => {
          walk(item, cbProp, cbObj, warningBlock, gridColumnsValue)
        })
        break
      case 'Object':
        cbObj(node)
        mods = node.children && node.children.find(node => node.key.value === 'mods')
        sizeOfColumns = getMod(mods, 'm-columns')

        node.children.forEach((property: jsonToAst.AstProperty) => {
          if (property.value.value === 'warning') {
            warningBlock = true
          }
          if (property.value.value === 'grid' && sizeOfColumns) {
            gridColumnsValue = sizeOfColumns && Number(sizeOfColumns.value.value)
          }

          cbProp(property, warningBlock, mods, node, gridColumnsValue)
          walk(property.value, cbProp, cbObj, warningBlock, gridColumnsValue)
        })
        break
    }
  }

  function parseJson (json: string):JsonAST { return jsonToAst(json) }

  const errors: LinterProblem<TProblemKey>[] = []
  const ast: JsonAST = parseJson(json)
  const log = {
    data: {}
  }
  if (ast) {
    walk(ast,
      (property: jsonToAst.AstProperty, isWarningBlock: boolean, mods: any, ast: jsonToAst.AstJsonEntity, gridColumnsValue?: number) => validateProperty(property, isWarningBlock, log, mods, ast, gridColumnsValue).forEach((err: any) => errors.push(err)),
      (obj: jsonToAst.AstObject) => validateObject(obj).forEach(err => errors.push(err))
    )
  }
  return errors
}
