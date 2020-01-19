export enum RuleKeys {
    UppercaseNamesIsForbidden = 'uppercaseNamesIsForbidden',
    BlockNameIsRequired = 'blockNameIsRequired',

    WarningTextSizes = 'WARNING_TEXT_SIZES_SHOULD_BE_EQUAL',
    WarningButtonSize = 'WARNING_INVALID_BUTTON_SIZE',
    WarningButtonPosition = 'WARNING_INVALID_BUTTON_POSITION',
    WarningPlaceholderSize = 'WARNING_INVALID_PLACEHOLDER_SIZE'
}

export enum Severity {
    Error = 'Error',
    Warning = 'Warning',
    Information = 'Information',
    Hint = 'Hint',
    None = 'None'
}

export interface SeverityConfiguration {
    [RuleKeys.BlockNameIsRequired]: Severity;
    [RuleKeys.UppercaseNamesIsForbidden]: Severity;

    [RuleKeys.WarningTextSizes]: Severity;
    [RuleKeys.WarningButtonSize]: Severity;
    [RuleKeys.WarningButtonPosition]: Severity;
    [RuleKeys.WarningPlaceholderSize]: Severity;

}

export interface ExampleConfiguration {

    enable: boolean;

    severity: SeverityConfiguration;
}
