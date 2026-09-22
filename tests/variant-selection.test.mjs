import test from 'node:test';
import assert from 'node:assert/strict';
import {variantIdentity, validateVariantPool, selectUnseenVariants} from '../src/variant-selection.js';

const question = (id, patch = {}) => ({id, variantKey:`variant-${id}`, prompt:`${id}에서 먼저 할 일은?`, options:[{id:'a',label:'영점을 맞춘다.'},{id:'b',label:'물체를 매단다.'}], answerId:'a', ...patch});
const clone = value => JSON.parse(JSON.stringify(value));
const freeze = value => {if(value && typeof value === 'object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
const seeded = seed => () => {seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};

test('identity ignores IDs, option order, whitespace and NFKC formatting only', () => {
  const first=question('original',{prompt:'２０ N 물체를 건다.',variantKey:' 물리－ ０１ '});
  const alias=question('renamed',{variantKey:'물리-01',prompt:'20N\n물체를\t건다.',options:[{id:'new-b',label:'물체를\n매단다.'},{id:'new-a',label:'영점을맞춘다.'}],answerId:'new-a'});
  assert.deepEqual(variantIdentity(first),variantIdentity(alias));
  assert.equal(variantIdentity(first).semantic,'물리-01');
});

test('correct answer meaning and scientific letter case are not discarded', () => {
  const first=question('a',{prompt:'5 mN을 읽는다.'});
  assert.notEqual(variantIdentity(first).content,variantIdentity({...first,answerId:'b'}).content);
  assert.notEqual(variantIdentity(first).content,variantIdentity({...first,prompt:'5 MN을 읽는다.'}).content);
});

test('semantic duplicates and same-content aliases are one finite variant each', () => {
  const first=question('a');
  const semanticAlias=question('a-reworded',{variantKey:first.variantKey,prompt:'먼저 해야 하는 절차는?'});
  const contentAlias={...clone(first),id:'a-new-id',variantKey:'alias-semantic'};
  const distinct=question('b');
  const output=selectUnseenVariants([first,semanticAlias,contentAlias,distinct],[],99,()=>0);
  assert.deepEqual(output.selected.map(item=>item.id),['a','b']);
  assert.deepEqual({remaining:output.remaining,exhausted:output.exhausted},{remaining:0,exhausted:true});
});

test('a semantic-content alias bridge cannot reopen previously seen variants', () => {
  const a=question('a'), bridge=question('bridge',{variantKey:a.variantKey,prompt:'연결된 문항'}), b=question('b',{prompt:'연결된 문항'});
  for(const prior of [a,bridge,b])assert.deepEqual(selectUnseenVariants([a,bridge,b],[variantIdentity(prior)],20,()=>0),{selected:[],remaining:0,exhausted:true});
});

test('partial and full history excludes by either semantic or content', () => {
  const pool=['a','b','c'].map(id=>question(id));
  const seenSemantic={semantic:pool[0].variantKey,content:'historical-wording'};
  const seenContent={semantic:'historical-key',content:variantIdentity(pool[1]).content};
  const output=selectUnseenVariants(pool,[seenSemantic,seenContent],1,()=>.8);
  assert.deepEqual(output.selected.map(item=>item.id),['c']);
  assert.equal(output.exhausted,true);
  assert.deepEqual(selectUnseenVariants(pool,pool.map(variantIdentity),4,()=>{throw Error('must not draw');}),{selected:[],remaining:0,exhausted:true});
});

test('zero count reports availability, does not draw, mutate or consume history', () => {
  const pool=freeze(['a','b','c'].map(id=>question(id))),seen=freeze([variantIdentity(pool[1])]);
  const before=JSON.stringify({pool,seen});
  assert.deepEqual(selectUnseenVariants(pool,seen,0,()=>{throw Error('must not draw');}),{selected:[],remaining:2,exhausted:false});
  const output=selectUnseenVariants(pool,seen,1,()=>0);
  assert.equal(output.selected[0],pool[0]);
  assert.equal(output.remaining,1);
  assert.equal(JSON.stringify({pool,seen}),before);
});

test('empty and oversized draws stop rather than refill', () => {
  assert.deepEqual(selectUnseenVariants([],[],15),{selected:[],remaining:0,exhausted:true});
  let calls=0;
  const output=selectUnseenVariants([question('a'),question('b')],[],100,()=>{calls++;return .999999;});
  assert.deepEqual(output.selected.map(item=>item.id),['b','a']);
  assert.equal(calls,2);
  assert.equal(output.remaining,0);
});

test('all pool records are validated even for count zero or a fully seen pool', () => {
  const valid=question('a');
  for(const invalid of [null,{}, {...valid,id:''},{...valid,variantKey:' \n'},{...valid,prompt:5},{...valid,options:[]},{...valid,options:[valid.options[0]]},{...valid,answerId:'missing'}]){
    assert.throws(()=>selectUnseenVariants([valid,{...invalid,id:invalid?.id??'invalid'}],[variantIdentity(valid)],0));
  }
  assert.equal(validateVariantPool([valid]).length,1);
  assert.throws(()=>validateVariantPool('not a pool'),/pool must be an array/);
  assert.throws(()=>validateVariantPool(new Array(1)),/question object/);
});

test('duplicate item IDs reject both equal and conflicting content, including normalized aliases', () => {
  const first=question('a');
  assert.throws(()=>selectUnseenVariants([first,clone(first)]),/duplicate item id/);
  assert.throws(()=>selectUnseenVariants([first,{...question('a'),prompt:'다른 문항'}]),/duplicate item id/);
  assert.throws(()=>selectUnseenVariants([question('Ａ'),question('A')]),/duplicate item id/);
});

test('option validation rejects ambiguous IDs, indistinguishable labels and non-exact answer references', () => {
  for(const patch of [
    {options:[{id:'a',label:'영점'},{id:'a',label:'표시자'}]},
    {options:[{id:'a',label:'영점'},{id:'b',label:'영 점'}]},
    {options:[{id:'a',label:''},{id:'b',label:'표시자'}]},
    {options:[null,{id:'b',label:'표시자'}]},
    {answerId:' a '},
  ])assert.throws(()=>variantIdentity(question('a',patch)));
});

test('invalid count, history and random sources fail closed', () => {
  const pool=[question('a')];
  for(const count of [-1,.5,NaN,Infinity,'1'])assert.throws(()=>selectUnseenVariants(pool,[],count),/count/);
  assert.equal(selectUnseenVariants(pool,[],Number.MAX_VALUE,()=>0).selected.length,1);
  for(const value of [-.01,1,Infinity,NaN,'0',null,undefined])assert.throws(()=>selectUnseenVariants(pool,[],1,()=>value),/random/);
  assert.throws(()=>selectUnseenVariants(pool,[],1,null),/random/);
  for(const seen of [null,{},[null],[{}],[{semantic:'a',content:''}],[{semantic:'',content:'x'}]])assert.throws(()=>selectUnseenVariants(pool,seen,0),/seen/);
});

test('deterministic RNG is injected and no replacement occurs inside a batch', () => {
  const pool=['a','b','c','d'].map(id=>question(id));
  assert.deepEqual(selectUnseenVariants(pool,[],3,seeded(7)),selectUnseenVariants(pool,[],3,seeded(7)));
  const picked=selectUnseenVariants(pool,[],4,()=>0).selected.map(variantIdentity);
  assert.equal(new Set(picked.map(identity=>identity.semantic)).size,4);
  assert.equal(new Set(picked.map(identity=>identity.content)).size,4);
});

test('100 seeded mixed-type sequences exhaust their finite pool without any repeated variant', () => {
  const base=['part-name','zero-first','eye-height','hook-use','reading','load-limit'].map(id=>question(id,{type:id}));
  const aliases=base.map((item,index)=>({...clone(item),id:`alias-${index}`,variantKey:`alias-key-${index}`,options:[...item.options].reverse()}));
  const pool=freeze([...base,...aliases]);
  for(let seed=1;seed<=100;seed++){
    const random=seeded(seed),seen=[],ids=[];
    for(let iteration=0;iteration<base.length+2;iteration++){
      const output=selectUnseenVariants(pool,seen,1+(iteration%3),random);
      for(const item of output.selected){
        const identity=variantIdentity(item);
        assert(!seen.some(prior=>prior.semantic===identity.semantic||prior.content===identity.content));
        seen.push(identity);ids.push(item.id);
      }
      assert.equal(output.remaining,base.length-seen.length);
      if(output.exhausted)break;
    }
    assert.equal(ids.length,base.length);
    assert.deepEqual(selectUnseenVariants(pool,seen,99,random),{selected:[],remaining:0,exhausted:true});
  }
});
