/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as assert from 'assert';
import {Cursor} from 'vs/editor/common/controller/cursor';
import {Position} from 'vs/editor/common/core/position';
import {Handler, IEditorOptions, ITextModelCreationOptions, CursorMoveViewPosition, ISelection, IPosition} from 'vs/editor/common/editorCommon';
import {Model} from 'vs/editor/common/model/model';
import {IMode} from 'vs/editor/common/modes';
import {MockConfiguration} from 'vs/editor/test/common/mocks/mockConfiguration';
import {viewModelHelper as aViewModelHelper} from 'vs/editor/test/common/editorTestUtils';
import {IViewModelHelper} from 'vs/editor/common/controller/oneCursor';
import {Range} from 'vs/editor/common/core/range';

let H = Handler;

suite('Cursor move command test', () => {
	const LINE1 = '    \tMy First Line\t ';
	const LINE2 = '\tMy Second Line';
	const LINE3 = '    Third Line💩';
	const LINE4 = '';
	const LINE5 = '1';

	let thisModel: Model;
	let thisConfiguration: MockConfiguration;
	let thisCursor: Cursor;

	setup(() => {
		let text =
			LINE1 + '\r\n' +
			LINE2 + '\n' +
			LINE3 + '\n' +
			LINE4 + '\r\n' +
			LINE5;

		thisModel = Model.createFromString(text);
		thisConfiguration = new MockConfiguration(null);
	});

	teardown(() => {
		thisCursor.dispose();
		thisModel.dispose();
		thisConfiguration.dispose();
	});

	test('move to first character of line from middle', () => {
		thisCursor= aCursor();
		moveTo(thisCursor, 1, 8);
		moveToLineStart(thisCursor);
		cursorEqual(thisCursor, 1, 1);
	});

	test('move to first character of line from first non white space character', () => {
		thisCursor= aCursor();
		moveTo(thisCursor, 1, 6);

		moveToLineStart(thisCursor);

		cursorEqual(thisCursor, 1, 1);
	});

	test('move to first character of line from first character', () => {
		thisCursor= aCursor();
		moveTo(thisCursor, 1, 1);

		moveToLineStart(thisCursor);

		cursorEqual(thisCursor, 1, 1);
	});

	test('move to first non white space character of line from middle', () => {
		thisCursor= aCursor();
		moveTo(thisCursor, 1, 8);

		moveToLineFirstNonWhiteSpaceCharacter(thisCursor);

		cursorEqual(thisCursor, 1, 6);
	});

	test('move to first non white space character of line from first non white space character', () => {
		thisCursor= aCursor();
		moveTo(thisCursor, 1, 6);

		moveToLineFirstNonWhiteSpaceCharacter(thisCursor);

		cursorEqual(thisCursor, 1, 6);
	});

	test('move to first non white space character of line from first character', () => {
		thisCursor= aCursor();
		moveTo(thisCursor, 1, 1);

		moveToLineFirstNonWhiteSpaceCharacter(thisCursor);

		cursorEqual(thisCursor, 1, 6);
	});

	test('move to end of line from middle', () => {
		thisCursor= aCursor();
		moveTo(thisCursor, 1, 8);

		moveToLineEnd(thisCursor);

		cursorEqual(thisCursor, 1, LINE1.length + 1);
	});

	test('move to end of line from last non white space character', () => {
		thisCursor= aCursor();
		moveTo(thisCursor, 1, LINE1.length - 1);

		moveToLineEnd(thisCursor);

		cursorEqual(thisCursor, 1, LINE1.length + 1);
	});

	test('move to end of line from line end', () => {
		thisCursor= aCursor();
		moveTo(thisCursor, 1, LINE1.length + 1);

		moveToLineEnd(thisCursor);

		cursorEqual(thisCursor, 1, LINE1.length + 1);
	});

	test('move to last non white space character from middle', () => {
		thisCursor= aCursor();
		moveTo(thisCursor, 1, 8);

		moveToLineLastNonWhiteSpaceCharacter(thisCursor);

		cursorEqual(thisCursor, 1, LINE1.length - 1);
	});

	test('move to last non white space character from last non white space character', () => {
		thisCursor= aCursor();
		moveTo(thisCursor, 1, LINE1.length - 1);

		moveToLineLastNonWhiteSpaceCharacter(thisCursor);

		cursorEqual(thisCursor, 1, LINE1.length - 1);
	});

	test('move to last non white space character from line end', () => {
		thisCursor= aCursor();
		moveTo(thisCursor, 1, LINE1.length + 1);

		moveToLineLastNonWhiteSpaceCharacter(thisCursor);

		cursorEqual(thisCursor, 1, LINE1.length - 1);
	});

	test('move to center of line not from center', () => {
		thisCursor= aCursor();
		moveTo(thisCursor, 1, 8);

		moveToLineCenter(thisCursor);

		cursorEqual(thisCursor, 1, 11);
	});

	test('move to center of line from center', () => {
		thisCursor= aCursor();
		moveTo(thisCursor, 1, 11);

		moveToLineCenter(thisCursor);

		cursorEqual(thisCursor, 1, 11);
	});

	test('move to center of line from start', () => {
		thisCursor= aCursor();
		moveToLineStart(thisCursor);

		moveToLineCenter(thisCursor);

		cursorEqual(thisCursor, 1, 11);
	});

	test('move to center of line from end', () => {
		thisCursor= aCursor();
		moveToLineEnd(thisCursor);

		moveToLineCenter(thisCursor);

		cursorEqual(thisCursor, 1, 11);
	});

	test('move up by cursor move command', () => {
		thisCursor= aCursor();

		moveTo(thisCursor, 3, 5);
		cursorEqual(thisCursor, 3, 5);

		moveUpByCursorMoveCommand(thisCursor, 2);
		cursorEqual(thisCursor, 1, 5);

		moveUpByCursorMoveCommand(thisCursor, 1);
		cursorEqual(thisCursor, 1, 1);
	});

	test('move up with selection by cursor move command', () => {
		thisCursor= aCursor();

		moveTo(thisCursor, 3, 5);
		cursorEqual(thisCursor, 3, 5);

		moveUpByCursorMoveCommand(thisCursor, 1, true);
		cursorEqual(thisCursor, 2, 2, 3, 5);

		moveUpByCursorMoveCommand(thisCursor, 1, true);
		cursorEqual(thisCursor, 1, 5, 3, 5);
	});

	test('move up and down with tabs by cursor move command', () => {
		thisCursor= aCursor();

		moveTo(thisCursor, 1, 5);
		cursorEqual(thisCursor, 1, 5);

		moveDownByCursorMoveCommand(thisCursor, 4);
		cursorEqual(thisCursor, 5, 2);

		moveUpByCursorMoveCommand(thisCursor, 1);
		cursorEqual(thisCursor, 4, 1);

		moveUpByCursorMoveCommand(thisCursor, 1);
		cursorEqual(thisCursor, 3, 5);

		moveUpByCursorMoveCommand(thisCursor, 1);
		cursorEqual(thisCursor, 2, 2);

		moveUpByCursorMoveCommand(thisCursor, 1);
		cursorEqual(thisCursor, 1, 5);
	});

	test('move up and down with end of lines starting from a long one by cursor move command', () => {
		thisCursor= aCursor();

		moveToEndOfLine(thisCursor);
		cursorEqual(thisCursor, 1, LINE1.length - 1);

		moveToEndOfLine(thisCursor);
		cursorEqual(thisCursor, 1, LINE1.length + 1);

		moveDownByCursorMoveCommand(thisCursor, 2);
		cursorEqual(thisCursor, 3, LINE3.length + 1);

		moveDownByCursorMoveCommand(thisCursor, 1);
		cursorEqual(thisCursor, 4, LINE4.length + 1);

		moveDownByCursorMoveCommand(thisCursor, 1);
		cursorEqual(thisCursor, 5, LINE5.length + 1);

		moveUpByCursorMoveCommand(thisCursor, 4);
		cursorEqual(thisCursor, 1, LINE1.length + 1);
	});

	test('move to view top line moves to first visible line if it is first line', () => {
		let viewModelHelper= aViewModelHelper(thisModel);
		viewModelHelper.getCurrentVisibleRange= () =>  new Range(1, 1, 10, 1);
		thisCursor= aCursor(viewModelHelper);

		moveTo(thisCursor, 2, 2);
		moveToTop(thisCursor);

		cursorEqual(thisCursor, 1, 6);
	});

	test('move to view top line moves to top visible line when first line is not visible', () => {
		let viewModelHelper= aViewModelHelper(thisModel);
		viewModelHelper.getCurrentVisibleRange= () =>  new Range(2, 1, 10, 1);
		thisCursor= aCursor(viewModelHelper);

		moveTo(thisCursor, 4, 1);
		moveToTop(thisCursor);

		cursorEqual(thisCursor, 2, 2);
	});

	test('move to view top line moves to nth line from top', () => {
		let viewModelHelper= aViewModelHelper(thisModel);
		viewModelHelper.getCurrentVisibleRange= () =>  new Range(1, 1, 10, 1);
		thisCursor= aCursor(viewModelHelper);

		moveTo(thisCursor, 4, 1);
		moveToTop(thisCursor, 3);

		cursorEqual(thisCursor, 3, 5);
	});

	test('move to view top line moves to last line if n is greater than last visible line number', () => {
		let viewModelHelper= aViewModelHelper(thisModel);
		viewModelHelper.getCurrentVisibleRange= () =>  new Range(1, 1, 3, 1);
		thisCursor= aCursor(viewModelHelper);

		moveTo(thisCursor, 2, 2);
		moveToTop(thisCursor, 4);

		cursorEqual(thisCursor, 3, 5);
	});

	test('move to view center line moves to the center line', () => {
		let viewModelHelper= aViewModelHelper(thisModel);
		viewModelHelper.getCurrentCenteredRange= () =>  new Range(3, 1, 3, 1);
		thisCursor= aCursor(viewModelHelper);

		moveTo(thisCursor, 2, 2);
		moveToCenter(thisCursor);

		cursorEqual(thisCursor, 3, 5);
	});

	test('move to view bottom line moves to last visible line if it is last line', () => {
		let viewModelHelper= aViewModelHelper(thisModel);
		viewModelHelper.getCurrentVisibleRange= () =>  new Range(1, 1, 5, 1);
		thisCursor= aCursor(viewModelHelper);

		moveTo(thisCursor, 2, 2);
		moveToBottom(thisCursor);

		cursorEqual(thisCursor, 5, 1);
	});

	test('move to view bottom line moves to last visible line when last line is not visible', () => {
		let viewModelHelper= aViewModelHelper(thisModel);
		viewModelHelper.getCurrentVisibleRange= () =>  new Range(2, 1, 3, 1);
		thisCursor= aCursor(viewModelHelper);

		moveTo(thisCursor, 2, 2);
		moveToBottom(thisCursor);

		cursorEqual(thisCursor, 3, 5);
	});

	test('move to view bottom line moves to nth line from bottom', () => {
		let viewModelHelper= aViewModelHelper(thisModel);
		viewModelHelper.getCurrentVisibleRange= () =>  new Range(1, 1, 5, 1);
		thisCursor= aCursor(viewModelHelper);

		moveTo(thisCursor, 4, 1);
		moveToBottom(thisCursor, 3);

		cursorEqual(thisCursor, 3, 5);
	});

	test('move to view bottom line moves to first line if n is lesser than first visible line number', () => {
		let viewModelHelper= aViewModelHelper(thisModel);
		viewModelHelper.getCurrentVisibleRange= () =>  new Range(2, 1, 5, 1);
		thisCursor= aCursor(viewModelHelper);

		moveTo(thisCursor, 4, 1);
		moveToBottom(thisCursor, 5);

		cursorEqual(thisCursor, 2, 2);
	});

	function aCursor(viewModelHelper?: IViewModelHelper): Cursor {
		return new Cursor(1, thisConfiguration, thisModel, viewModelHelper || aViewModelHelper(thisModel), false);
	}

});

interface ICursorOpts {
	text: string[];
	mode?: IMode;
	modelOpts?: ITextModelCreationOptions;
	editorOpts?: IEditorOptions;
}

// --------- utils

function cursorCommand(cursor: Cursor, command: string, extraData?: any, overwriteSource?: string) {
	cursor.trigger(overwriteSource || 'tests', command, extraData);
}



// Move command

function move(cursor: Cursor, args: any) {
	cursorCommand(cursor, H.CursorMove, args);
}

function moveToLineStart(cursor: Cursor) {
	move(cursor, {to: CursorMoveViewPosition.LineStart});
}

function moveToLineFirstNonWhiteSpaceCharacter(cursor: Cursor) {
	move(cursor, {to: CursorMoveViewPosition.LineFirstNonWhitespaceCharacter});
}

function moveToLineCenter(cursor: Cursor) {
	move(cursor, {to: CursorMoveViewPosition.LineColumnCenter});
}

function moveToLineEnd(cursor: Cursor) {
	move(cursor, {to: CursorMoveViewPosition.LineEnd});
}

function moveToLineLastNonWhiteSpaceCharacter(cursor: Cursor) {
	move(cursor, {to: CursorMoveViewPosition.LineLastNonWhitespaceCharacter});
}

function moveUpByCursorMoveCommand(cursor: Cursor, noOfLines: number= 1, inSelectionMode?: boolean) {
	move(cursor, {to: CursorMoveViewPosition.LineUp, noOfLines: noOfLines, inSelectionMode: inSelectionMode});
}

function moveDownByCursorMoveCommand(cursor: Cursor, noOfLines: number= 1, inSelectionMode?: boolean) {
	move(cursor, {to: CursorMoveViewPosition.LineDown, noOfLines: noOfLines, inSelectionMode: inSelectionMode});
}

function moveToTop(cursor: Cursor, noOfLines: number= 1, inSelectionMode?: boolean) {
	move(cursor, {to: CursorMoveViewPosition.LineViewTop, noOfLines: noOfLines, inSelectionMode: inSelectionMode});
}

function moveToCenter(cursor: Cursor, inSelectionMode?: boolean) {
	move(cursor, {to: CursorMoveViewPosition.LineViewCenter, inSelectionMode: inSelectionMode});
}

function moveToBottom(cursor: Cursor, noOfLines: number= 1, inSelectionMode?: boolean) {
	move(cursor, {to: CursorMoveViewPosition.LineViewBottom, noOfLines: noOfLines, inSelectionMode: inSelectionMode});
}

function cursorEqual(cursor: Cursor, posLineNumber: number, posColumn: number, selLineNumber: number = posLineNumber, selColumn: number = posColumn) {
	positionEqual(cursor.getPosition(), posLineNumber, posColumn);
	selectionEqual(cursor.getSelection(), posLineNumber, posColumn, selLineNumber, selColumn);
}

function positionEqual(position:IPosition, lineNumber: number, column: number) {
	assert.deepEqual({
		lineNumber: position.lineNumber,
		column: position.column
	}, {
		lineNumber: lineNumber,
		column: column
	}, 'position equal');
}

function selectionEqual(selection:ISelection, posLineNumber: number, posColumn: number, selLineNumber: number, selColumn: number) {
	assert.deepEqual({
		selectionStartLineNumber: selection.selectionStartLineNumber,
		selectionStartColumn: selection.selectionStartColumn,
		positionLineNumber: selection.positionLineNumber,
		positionColumn: selection.positionColumn
	}, {
		selectionStartLineNumber: selLineNumber,
		selectionStartColumn: selColumn,
		positionLineNumber: posLineNumber,
		positionColumn: posColumn
	}, 'selection equal');
}

function moveTo(cursor: Cursor, lineNumber: number, column: number, inSelectionMode: boolean = false) {
	cursorCommand(cursor, inSelectionMode ? H.MoveToSelect : H.MoveTo, { position: new Position(lineNumber, column) });
}

function moveToEndOfLine(cursor: Cursor, inSelectionMode: boolean = false) {
	cursorCommand(cursor, inSelectionMode ?  H.CursorEndSelect : H.CursorEnd);
}