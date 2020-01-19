export enum RuleKeys {
    UppercaseNamesIsForbidden = 'uppercaseNamesIsForbidden',
    BlockNameIsRequired = 'blockNameIsRequired',
    WarningTextSizes = 'WARNING_TEXT_SIZES_SHOULD_BE_EQUAL',
    WarningButtonSize = 'WARNING_INVALID_BUTTON_SIZE',
    WarningButtonPosition = 'WARNING_INVALID_BUTTON_POSITION',
    WarningPlaceholderSize = 'WARNING_INVALID_PLACEHOLDER_SIZE',
    TextSeveralH1 = 'TEXT_SEVERAL_H1',
    TextInvalidH2Position = 'TEXT_INVALID_H2_POSITION',
    TextInvalidH3Position = 'TEXT_INVALID_H3_POSITION',
    GridTooMuchMarketingBlocks = 'GRID_TOO_MUCH_MARKETING_BLOCKS'
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

    [RuleKeys.TextSeveralH1]: Severity;
    [RuleKeys.TextInvalidH2Position]: Severity;
    [RuleKeys.TextInvalidH3Position]: Severity;

    [RuleKeys.GridTooMuchMarketingBlocks]: Severity;
}

export interface ExampleConfiguration {

    enable: boolean;

    severity: SeverityConfiguration;
}
