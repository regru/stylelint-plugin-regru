var stylelint                = require("stylelint"),
    ruleName                 = "stylelint-plugin-regru/function-space-quotes-inside",
    valueParser              = require("postcss-value-parser"),
    report                   = stylelint.utils.report,
    ruleMessages             = stylelint.utils.ruleMessages,
    validateOptions          = stylelint.utils.validateOptions;

function declarationValueIndex (decl) {
  const beforeColon = decl.toString().indexOf(":")
  const afterColon = decl.raw("between").length - decl.raw("between").indexOf(":")
  return beforeColon + afterColon
}

function isSingleLineString (input) {
  return !/[\n\r]/.test(input)
}

function isStandardSyntaxFunction (node) {
  // Function nodes without names are things in parentheses like Sass lists
  if (!node.value) { return false }

  return true
}

const messages = ruleMessages(ruleName, {
  expectedOpening: "Expected single space after \"(\"",
  rejectedOpening: "Unexpected whitespace after \"(\"",
  expectedClosing: "Expected single space before \")\"",
  rejectedClosing: "Unexpected whitespace before \")\"",
  expectedOpeningSingleLine:        "Expected single space after \"(\" in a single-line function",
  expectedOpeningSingleLineString:  "Expected single space after \"(\" in a single-line function with STRING param",
  rejectedOpeningSingleLine:        "Unexpected whitespace after \"(\" in a single-line function",
  rejectedOpeningSingleLineString:  "Unexpected whitespace after \"(\" in a single-line function with STRING param",
  expectedClosingSingleLine:        "Expected single space before \")\" in a single-line function",
  expectedClosingSingleLineString:  "Expected single space before \")\" in a single-line function with STRING param",
  rejectedClosingSingleLine:        "Unexpected whitespace before \")\" in a single-line function",
  rejectedClosingSingleLineString:  "Unexpected whitespace before \")\" in a single-line function with STRING param",
})

module.exports = stylelint.createPlugin(ruleName, function(expectation, secondaryOptionObject) {
  return function(root, result) {
    const validOptions = validateOptions(result, ruleName, {
      actual: expectation,
      possible: [
        "always",
        "never",
        "always-single-line",
        "never-single-line",
        "always-single-line-quotes",
        "never-single-line-quotes",
      ],
    });

    if (!validOptions) { return }

    root.walkDecls(decl => {

      if (decl.value.indexOf("(") === -1) { return }

      valueParser(decl.value).walk(valueNode => {
        if (valueNode.type !== "function") { return }

        if (!isStandardSyntaxFunction(valueNode)) { return }

        const functionString = valueParser.stringify(valueNode)
        const isSingleLine = isSingleLineString(functionString)

        // Check opening ...

        const openingIndex = valueNode.sourceIndex + valueNode.value.length + 1
        var ruleApplied = false;


        if (isSingleLine && expectation === "always-single-line-quotes") {

          if ( valueNode.nodes.length == 1 && valueNode.nodes[0].type === 'string' ) {

            if ( valueNode.before !== " " ) {
              complain(messages.expectedOpeningSingleLineString, openingIndex);
            }

            ruleApplied = true;
          }
        }

        if (isSingleLine && expectation === "never-single-line-quotes") {

          if ( valueNode.nodes.length == 1 && valueNode.nodes[0].type === 'string' ) {

            if ( valueNode.before !== "" ) {
              complain(messages.rejectedOpeningSingleLineString, openingIndex);
            }

            ruleApplied = true;
          }
        }

        if ( !ruleApplied ) {
          if (expectation === "always" && valueNode.before !== " ") {
            complain(messages.expectedOpening, openingIndex)
          }

          if (expectation === "never" && valueNode.before !== "") {
            complain(messages.rejectedOpening, openingIndex)
          }

          if (isSingleLine && (expectation === "always-single-line" || expectation === "never-single-line-quotes") && valueNode.before !== " ") {
            complain(messages.expectedOpeningSingleLine, openingIndex)
          }

          if (isSingleLine && (expectation === "never-single-line" || expectation === "always-single-line-quotes") && valueNode.before !== "") {
            complain(messages.rejectedOpeningSingleLine, openingIndex)
          }
        }

        // Check closing ...

        const closingIndex = valueNode.sourceIndex + functionString.length - 2

        ruleApplied = false;

        if (isSingleLine && expectation === "always-single-line-quotes") {

          if ( valueNode.nodes.length == 1 && valueNode.nodes[0].type === 'string' ) {

            if ( valueNode.after !== " " ) {
              complain(messages.expectedClosingSingleLineString, closingIndex);
            }

            ruleApplied = true;
          }
        }

        if (isSingleLine && expectation === "never-single-line-quotes") {

          if ( valueNode.nodes.length == 1 && valueNode.nodes[0].type === 'string' ) {

            if ( valueNode.after !== "" ) {
              complain(messages.rejectedClosingSingleLineString, closingIndex);
            }

            ruleApplied = true;
          }
        }


        if ( !ruleApplied ) {
          if (expectation === "always" && valueNode.after !== " ") {
            complain(messages.expectedClosing, closingIndex)
          }

          if (expectation === "never" && valueNode.after !== "") {
            complain(messages.rejectedClosing, closingIndex)
          }

          if (isSingleLine && (expectation === "always-single-line" || expectation === "never-single-line-quotes") && valueNode.after !== " ") {
            complain(messages.expectedClosingSingleLine, closingIndex)
          }

          if (isSingleLine && (expectation === "never-single-line" || expectation === "always-single-line-quotes") && valueNode.after !== "") {
            complain(messages.rejectedClosingSingleLine, closingIndex)
          }
        }

      })

      function complain(message, offset) {
        report({
          ruleName,
          result,
          message,
          node: decl,
          index: declarationValueIndex(decl) + offset,
        })
      }
    })
  }
})
