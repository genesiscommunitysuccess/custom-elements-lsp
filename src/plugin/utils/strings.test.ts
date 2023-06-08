import { LineAndCharacter, TextSpan } from 'typescript/lib/tsserverlibrary';
import { TemplateContext } from 'typescript-template-language-service-decorator';
import { html } from '../../jest/utils';
import {
  getWholeTextReplacementSpan,
  replaceTemplateStringBinding,
  getPositionOfNthOccuranceEnd,
  parseAttrNamesFromRawString,
} from './strings';

describe('replaceTemplateStringBinding', () => {
  const testCases: [string, [string], string][] = [
    ['Empty string', [''], ''],
    ["Returns input string if it doesn't contain any template bindings", ['test ${}'], 'test ${}'],
    ['Returns input string the template binding is empty', ['test=${}'], 'test=${}'],
    [
      "Replaces template binding content with 'y' of the same length",
      ['test="${_ => \'hello\'}"'],
      'test="${yyyyyyyyyyyy}"',
    ],
    [
      'Replaces multiple template bindings',
      ['test="${_ => \'hello\'}" test="${_ => \'hello\'}"'],
      'test="${yyyyyyyyyyyy}" test="${yyyyyyyyyyyy}"',
    ],
  ];

  for (const [name, [input], expected] of testCases) {
    it(name, () => {
      expect(replaceTemplateStringBinding(input)).toEqual(expected);
    });
  }
});

describe('getWholeTextReplcaementSpan', () => {
  const testCases: [string, [LineAndCharacter, TemplateContext], TextSpan][] = [
    [
      'Returns the span of a string with the cursor in it',
      [
        { line: 1, character: 13 },
        html`
          test
        `,
      ],
      { start: 11, length: 3 },
    ],
    [
      'Returns the span of a string that contains a symbol character @',
      [
        { line: 1, character: 14 },
        html`
          @test
        `,
      ],
      { start: 11, length: 4 },
    ],
    [
      'Returns the span of a string that contains a symbol character ?',
      [
        { line: 1, character: 11 },
        html`
          ?test
        `,
      ],
      { start: 11, length: 1 },
    ],
    [
      'Returns the span of a string that contains a symbol character :',
      [
        { line: 1, character: 14 },
        html`
          :test
        `,
      ],
      { start: 11, length: 4 },
    ],
    [
      'Returns the span of a string accounting for a white space boundary',
      [
        { line: 1, character: 17 },
        html`
          test again
        `,
      ],
      { start: 16, length: 2 },
    ],
    [
      'Returns the starting at index 0 if there is no white space preceding the cursor',
      [
        { line: 0, character: 8 },
        // Formatters will try and spread html`testagain` onto a separate line so you'll
        // have to manually fix that if you use a formatter
        // eslint-disable-next-line
        html`testagain`,
      ],
      { start: 0, length: 8 },
    ],
  ];

  for (const [name, [position, context], expected] of testCases) {
    it('Happy path: ' + name, () => {
      expect(getWholeTextReplacementSpan(position, context)).toEqual(expected);
    });
  }

  const unhappyCases: [string, [LineAndCharacter, TemplateContext], string][] = [
    [
      "Index out of bounds if position isn't in context",
      [
        { line: 0, character: 500 },
        html`
          test
        `,
      ],
      'Span out of bounds in context.text',
    ],
  ];

  for (const [name, [position, context], expected] of unhappyCases) {
    it('Unhappy path: ' + name, () => {
      let e;
      try {
        const res = getWholeTextReplacementSpan(position, context);
        console.log(res);
      } catch (error) {
        e = error;
      }
      expect((e as any).message).toEqual(expected);
    });
  }
});

describe('getPositionOfNthTagEnd', () => {
  const tests: [string, [TemplateContext, string, number], any][] = [
    ['-2 for an invalid occurrence', [html``, 'a', 0], -2],
    ['-1 for empty string', [html``, 'a', 1], -1],
    [
      '-1 if the occurrence is too high',
      [
        html`
          <c-e></c-e>
        `,
        'c-e',
        2,
      ],
      -1,
    ],
    [
      'the end of the first and only occurrence',
      [
        html`
          <c-e></c-e>
        `,
        'c-e',
        1,
      ],
      15,
    ],
    [
      'the end of the first occurrence if requested',
      [
        html`
          <c-e></c-e>
          <c-e></c-e>
        `,
        'c-e',
        1,
      ],
      15,
    ],
    [
      'the end of the second occurrence if requested',
      [
        html`
          <c-e></c-e>
          <c-e></c-e>
        `,
        'c-e',
        2,
      ],
      37,
    ],
    [
      'the end of the third occurrence if requested',
      [
        html`
          <c-e></c-e>
          <c-e></c-e>
          <c-e></c-e>
        `,
        'c-e',
        3,
      ],
      59,
    ],
    [
      'the end of an occurrence in the middle',
      [
        html`
          <c-e></c-e>
          <c-e></c-e>
          <c-e></c-e>
        `,
        'c-e',
        2,
      ],
      37,
    ],
  ];

  for (const [name, [context, tagName, occurrence], expected] of tests) {
    it(name, () => {
      const result = getPositionOfNthOccuranceEnd({
        rawText: context.rawText,
        substring: `<${tagName}`,
        occurrence,
      });
      expect(result).toEqual(expected);
    });
  }
});

describe('parseAttrNamesFromRawString', () => {
  const testCases: [string, [string], string[]][] = [
    ['Returns an empty array for an empty string', [''], []],
    ['Returns the name of boolean attributes', ['testone test-two'], ['testone', 'test-two']],
    [
      'Returns the name multiple times if it is specified multiple times',
      ['testone testone'],
      ['testone', 'testone'],
    ],
    [
      'Returns the name of attributes',
      ['testone="test" test-two="test-again"'],
      ['testone', 'test-two'],
    ],
    [
      'Returns the name of attribute with binding',
      ['testone="${x => x.doSomething()}"'],
      ['testone'],
    ],
    [
      'Returns the name of attributes that start with symbols : @ ?',
      ['?testone="test" :test-two="test-again" @test-event="${(x,c) => x.event()}"'],
      ['?testone', ':test-two', '@test-event'],
    ],
    [
      'Can apply all rules at once and returns ',
      [
        'testone testone="test" ?testone="${x => true}" :testone="test-again" @testone="${(x,c) => x.event()}"',
      ],
      ['testone', 'testone', '?testone', ':testone', '@testone'],
    ],
  ];

  for (const [name, [input], expected] of testCases) {
    it(name, () => {
      expect(parseAttrNamesFromRawString(input)).toEqual(expected);
    });
  }
});
