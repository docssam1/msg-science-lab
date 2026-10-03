import test from 'node:test';
import assert from 'node:assert/strict';
import {buildWorksheetDocument} from '../sample-v2/worksheet-print.js';
import {bank} from '../sample-v2/remedy-bank.js';
import {advancedItems} from '../sample-v2/advanced-bank.js';

test('test-linked similar-problem sheet contains prompts but no answer-bearing source fields',()=>{
 const html=buildWorksheetDocument({lesson:1,kind:'remedy',items:bank.filter(item=>item.m==='M02')});
 assert.match(html,/테스트 연계 유사문제 워크지/);
 assert.match(html,/빈 용수철저울/);
 assert.match(html,/내가 고른 답/);
 assert.doesNotMatch(html,/측정 전에 영점을 맞춰야/);
 assert.doesNotMatch(html,/answerKey|variantKey|M02:|정답:/);
 assert.equal((html.match(/class="question"/g)||[]).length,2);
});

test('mixed response modes print choices, numeric blank, and written lines without solutions',()=>{
 const html=buildWorksheetDocument({lesson:2,kind:'advanced',items:advancedItems.filter(item=>item.lesson===2)});
 const written=buildWorksheetDocument({lesson:1,kind:'advanced',items:advancedItems.filter(item=>item.lesson===1)});
 assert.match(html,/테스트 연계 심화 워크지/);
 assert.match(html,/늘어난 길이/);
 assert.match(written,/writing-lines/);
 assert.match(html,/내가 고른 답/);
 assert.doesNotMatch(html,/3 cm × 3 = 9 cm/);
 assert.doesNotMatch(html,/재질의 영향만 알아보려면/);
 assert.equal((html.match(/class="question"/g)||[]).length,2);
 assert.equal((written.match(/class="question"/g)||[]).length,1);
});

test('the print projection refuses duplicates and invalid sheet contracts',()=>{
 assert.throws(()=>buildWorksheetDocument({lesson:1,kind:'remedy',items:[bank[0],bank[0]]}),/중복/);
 assert.throws(()=>buildWorksheetDocument({lesson:3,kind:'remedy',items:[bank[0]]}),TypeError);
 assert.throws(()=>buildWorksheetDocument({lesson:1,kind:'bank',items:[bank[0]]}),TypeError);
 assert.throws(()=>buildWorksheetDocument({lesson:1,kind:'remedy',items:[]}),TypeError);
 assert.throws(()=>buildWorksheetDocument({lesson:1,kind:'advanced',items:[advancedItems[0]]}),/다른 차시/);
 assert.throws(()=>buildWorksheetDocument({lesson:1,kind:'remedy',items:[bank.find(item=>item.m==='M05')]}),/다른 차시/);
});
