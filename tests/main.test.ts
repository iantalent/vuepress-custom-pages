import {suite, test} from '@testdeck/mocha';
import * as chai from 'chai';
import {
	BlockQuote,
	Bold,
	Code,
	Emoji,
	Heading,
	Italic,
	Link,
	Paragraph,
	SimpleFragment,
	SimpleFragmentsContainer,
	Tip,
} from "../lib";
import {buildMarkdown} from "../lib/utils";
import {MarkdownLine} from "../lib/builder";

const assert = chai.assert;

@suite
class pageFragments
{
	
	before()
	{
	
	}
	
	@test 'line'()
	{
		const lines = MarkdownLine.fromContent('start\r\n\r\nend');
		assert.equal(lines.length, 3);
		assert.isFalse(lines[0].splittedByLeft);
		assert.isTrue(lines[0].splittedByRight);
		assert.equal(lines[0].content(), 'start');
		assert.isTrue(lines[1].splittedByLeft);
		assert.isTrue(lines[1].splittedByRight);
		assert.isEmpty(lines[1].content());
		assert.isTrue(lines[2].splittedByLeft);
		assert.isFalse(lines[2].splittedByRight);
		assert.equal(lines[2].content(), 'end');
	}
	
	@test 'Simple Container'()
	{
		const page = new SimpleFragmentsContainer();
		page.add(
			new Heading("title", 1),
			new SimpleFragment('simple fragment'),
			new Paragraph(['Paragraph 1 ', new Bold('bold')]),
			new Paragraph(new Italic('Italic text')),
			new Paragraph(new Code('Boolean')),
			{content: 'Simple fragment'},
			{content: 'Simple fragment 2'},
			new Tip('You should go this way not that!'),
			new BlockQuote([
				'quote 1', new Paragraph('paragraph'),
				new BlockQuote([
					'quote 2', new Paragraph('paragraph 2'),
					new BlockQuote(['quote 3', new Paragraph('paragraph 3')])
				])
			]),
			new Paragraph('Some paragraph info')
		);
		assert.equal(buildMarkdown(page), '# title\r\n\r\n' +
			'simple fragment\r\n\r\n' +
			'Paragraph 1 **bold**\r\n\r\n' +
			'*Italic text*\r\n\r\n' +
			'`Boolean`\r\n\r\n' +
			'Simple fragmentSimple fragment 2\r\n\r\n' +
			'::: tip\r\n\r\nYou should go this way not that!\r\n\r\n:::\r\n\r\n' +
			'> quote 1\r\n>\r\n> paragraph\r\n>\r\n>> quote 2\r\n>>\r\n>> paragraph 2\r\n>>\r\n>>> quote 3\r\n>>>\r\n>>> paragraph 3\r\n\r\n' +
			'Some paragraph info');
	}
	
	@test 'Emoji'()
	{
		assert.equal(buildMarkdown([new Emoji('joy')]), ':joy:');
		assert.equal(buildMarkdown([new Emoji('tent')]), ':tent:');
	}
	
	@test 'VuePress Builtin fragments'()
	{
		assert.equal(buildMarkdown([new Tip('Tip content')]), '::: tip\r\n\r\nTip content\r\n\r\n:::');
		assert.equal(buildMarkdown(['-start', '\r\n\r\n', 'info', '\r\n\r\n', '-end']), '-start\r\n\r\ninfo\r\n\r\n-end');
	}
}