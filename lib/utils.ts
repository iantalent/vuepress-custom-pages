import {FragmentsContainer, SeparatedFragmentsContainer, SimpleFragmentsContainer} from "./container";
import {getTypeOrFunctionValue} from "./type";
import {Page} from "./page";
import {BlankLinesFragment, Fragment} from "./fragment";
import {type} from "os";

export function isFragmentsContainer(container: any): container is FragmentsContainer
{
	return typeof container['tree'] === 'function';
}

export function isSeparatedFragmentsContainer(container: any): container is SeparatedFragmentsContainer
{
	return ['string', 'function'].indexOf(typeof container['separator']) !== -1 && isFragmentsContainer(container);
}

export function isPage(page: any): page is Page
{
	return typeof page['path'] === 'function' &&
		typeof page['frontmatter'] === 'function' &&
		isFragmentsContainer(page);
}

export function isFragment(fragment: any): fragment is Fragment
{
	return typeof fragment['content'] === 'function';
}

function isBlankLinesFragment(fragment: any): fragment is BlankLinesFragment
{
	return ['boolean', 'function'].indexOf(typeof fragment['blankLines']) !== -1 &&  isFragment(fragment);
}

/**
 * @param {FragmentsContainer|Page} container
 * @returns {string}
 */
export function buildMarkdown(container: FragmentsContainer | Page): string
{
	let separator;
	
	if(isSeparatedFragmentsContainer(container))
		separator = getTypeOrFunctionValue(container.separator, container);
	else
		separator = isPage(container) ? "\r\n" : '';
	
	return container.tree().map(entry =>
	{
		if(typeof entry === 'string')
			return entry;
		else if(Array.isArray(entry))
			return buildMarkdown((new SimpleFragmentsContainer()).add(entry));
		else if(isFragmentsContainer(entry)) //FragmentsContainer
			return buildMarkdown(entry);
		else if(isFragment(entry))
		{
			const isBlankLines = isBlankLinesFragment(entry) && getTypeOrFunctionValue(entry.blankLines, entry),
				after = isBlankLines ? '\r\n' : '';
			return getTypeOrFunctionValue(entry.content, entry) + after;
		}
		else
			throw new Error('There is wrong item in container. Allowed only Fragment, FragmentsContainer, string');
	}).filter(value => value).join(separator)
}
