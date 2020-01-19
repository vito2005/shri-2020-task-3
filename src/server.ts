import {
  createConnection,
  ProposedFeatures,
  TextDocuments,
  InitializeParams,
  TextDocument,
  Diagnostic,
  DiagnosticSeverity,
  DidChangeConfigurationParams,
  DidChangeConfigurationNotification
} from 'vscode-languageserver'
import { getMod } from './helpers'
import { basename } from 'path'

import * as jsonToAst from 'json-to-ast'

import { ExampleConfiguration, Severity, RuleKeys } from './configuration'
import { makeLint, LinterProblem } from './linter'
import { warningButtonSizeRule, warningTextSizesRule, warningButtonPositionRule, warningPlaceholderSizeRule } from './additionalRules'

const conn = createConnection(ProposedFeatures.all)
const docs: TextDocuments = new TextDocuments()
let conf: ExampleConfiguration | undefined
let hasConfigurationCapability: boolean | undefined = false
let hasWorkspaceFolderCapability: boolean | undefined = false
let hasDiagnosticRelatedInformationCapability: boolean | undefined = false

conn.onInitialize((params: InitializeParams): any => {
  const capabilities = params.capabilities

  // Does the client support the `workspace/configuration` request?
  // If not, we will fall back using global settings
  hasConfigurationCapability =
      capabilities.workspace && !!capabilities.workspace.configuration
  hasWorkspaceFolderCapability =
      capabilities.workspace && !!capabilities.workspace.workspaceFolders
  hasDiagnosticRelatedInformationCapability =
      capabilities.textDocument &&
      capabilities.textDocument.publishDiagnostics &&
      capabilities.textDocument.publishDiagnostics.relatedInformation
  return {
    capabilities: {
      textDocumentSync: docs.syncKind,
      completionProvider: {
        resolveProvider: true
      }
    }
  }
})

conn.onInitialized(() => {
  if (hasConfigurationCapability) {
    // Register for all configuration changes.
    conn.client.register(DidChangeConfigurationNotification.type, undefined)
  }
  if (hasWorkspaceFolderCapability) {
    conn.workspace.onDidChangeWorkspaceFolders(_event => {
      conn.console.log('Workspace folder change event received.')
    })
  }
})

interface ExampleSettings {
    maxNumberOfProblems: number;
  }
const defaultSettings: ExampleSettings = { maxNumberOfProblems: 1000 }
let globalSettings: ExampleSettings = defaultSettings

// Cache the settings of all open documents
const documentSettings: Map<string, Thenable<ExampleSettings>> = new Map()

function GetSeverity (key: RuleKeys): DiagnosticSeverity | undefined {
  if (!conf || !conf.severity) {
    return undefined
  }

  const severity: Severity = conf.severity[key]

  switch (severity) {
    case Severity.Error:
      return DiagnosticSeverity.Error
    case Severity.Warning:
      return DiagnosticSeverity.Warning
    case Severity.Information:
      return DiagnosticSeverity.Information
    case Severity.Hint:
      return DiagnosticSeverity.Hint
    default:
      return undefined
  }
}

function GetMessage (key: RuleKeys): string {
  if (key === RuleKeys.BlockNameIsRequired) {
    return 'Field named \'block\' is required!'
  }

  if (key === RuleKeys.UppercaseNamesIsForbidden) {
    return 'Uppercase properties are forbidden!'
  }

  if (key === RuleKeys.WarningTextSizes) {
    return 'Тексты в блоке warning должны быть одного размера'
  }
  if (key === RuleKeys.WarningButtonSize) {
    return 'Размер кнопки блока warning должен быть на 1 шаг больше эталонного'
  }
  if (key === RuleKeys.WarningButtonPosition) {
    return 'Блок button в блоке warning не может находиться перед блоком placeholder на том же или более глубоком уровне вложенности'
  }
  if (key === RuleKeys.WarningPlaceholderSize) {
    return 'Допустимые размеры для блока placeholder в блоке warning: s, m, l'
  }

  return `Unknown problem type '${key}'`
}

async function validateTextDocument (textDocument: TextDocument): Promise<void> {
  const source = basename(textDocument.uri)
  const json = textDocument.getText()
  const validateObject = (
    obj: jsonToAst.AstObject
  ): LinterProblem<RuleKeys>[] => {
    return obj.children.some(p => p.key.value === 'block')
      ? []
      : [{ key: RuleKeys.BlockNameIsRequired, loc: obj.loc }]
  }

  const validateProperty = (
    property: jsonToAst.AstProperty,
    isWarningBlock: boolean,
    log: any,
    mods: any,
    ast: jsonToAst.AstJsonEntity
  ): LinterProblem<RuleKeys>[] => {
    const errors: LinterProblem<RuleKeys>[] = []
    if (isWarningBlock) {
      const size = getMod(mods, 'size')
      warningTextSizesRule({ log, property, size, errors, ast, RuleKeys })
      warningButtonSizeRule({ log, property, size, errors, ast, RuleKeys })
      warningButtonPositionRule({ log, property, errors, ast, RuleKeys })
      warningPlaceholderSizeRule({ log, property, size, errors, ast, RuleKeys })
    }

    if (/^[A-Z]+$/.test(property.key.value)) {
      errors.push(
        {
          key: RuleKeys.UppercaseNamesIsForbidden,
          loc: property.key.loc
        })
    }
    return errors
  }

  const diagnostics: Diagnostic[] = makeLint(
    json,
    validateProperty,
    validateObject
  ).reduce(
    (
      list: Diagnostic[],
      problem: LinterProblem<RuleKeys>
    ): Diagnostic[] => {
      const severity = GetSeverity(problem.key)

      if (severity) {
        const message = GetMessage(problem.key)

        const diagnostic: Diagnostic = {
          range: {
            start: textDocument.positionAt(
              problem.loc.start.offset
            ),
            end: textDocument.positionAt(problem.loc.end.offset)
          },
          severity,
          message,
          source
        }

        list.push(diagnostic)
      }
      return list
    },
    []
  )

  if (diagnostics.length) {
    conn.sendDiagnostics({ uri: textDocument.uri, diagnostics })
  }
}

async function validateAll () {
  for (const document of docs.all()) {
    await validateTextDocument(document)
  }
}

docs.onDidChangeContent(change => {
  validateTextDocument(change.document)
})

conn.onDidChangeConfiguration(({ settings }: DidChangeConfigurationParams) => {
  if (hasConfigurationCapability) {
    // Reset all cached document settings
    documentSettings.clear()
  } else {
    globalSettings = <ExampleSettings>(
          (settings.languageServerExample || defaultSettings)
        )
  }

  conf = settings.example
  validateAll()
})

docs.listen(conn)
conn.listen()
