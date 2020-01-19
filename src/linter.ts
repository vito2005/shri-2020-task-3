import * as jsonToAst from 'json-to-ast'

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
       mods: any, ast: jsonToAst.AstJsonEntity) => LinterProblem<TProblemKey>[],
  validateObject: (property: jsonToAst.AstObject) => LinterProblem<TProblemKey>[]
): LinterProblem<TProblemKey>[] {

  function walk (
    node: jsonToAst.AstJsonEntity,
    cbProp: (property: jsonToAst.AstProperty, isWarningBlock: boolean, mods: any, ast: jsonToAst.AstJsonEntity) => void,
    cbObj: (property: jsonToAst.AstObject) => void,
    warningBlock: boolean = false
  ) {
    let mods: any
    switch (node.type) {
      case 'Array':
        node.children.forEach((item: jsonToAst.AstJsonEntity) => {
          walk(item, cbProp, cbObj, warningBlock)
        })
        break
      case 'Object':
        cbObj(node)
        mods = node.children && node.children.find(node => node.key.value === 'mods')
        node.children.forEach((property: jsonToAst.AstProperty) => {
          if (property.value.value === 'warning') {
            warningBlock = true
          }

          cbProp(property, warningBlock, mods, node)
          walk(property.value, cbProp, cbObj, warningBlock)
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
      (property: jsonToAst.AstProperty, isWarningBlock: boolean, mods: any, ast: jsonToAst.AstJsonEntity) => validateProperty(property, isWarningBlock, log, mods, ast).forEach((err: any) => errors.push(err)),
      (obj: jsonToAst.AstObject) => validateObject(obj).forEach(err => errors.push(err))
    )
  }
  return errors
}
