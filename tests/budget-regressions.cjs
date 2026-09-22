// Regression: database decimal amounts must never be parsed as Italian thousands.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../budget-restyle.js'),'utf8');
const expression=source.match(/const groupExpenseTotal=([\s\S]*?);\s*const peopleCount/)[1];
for(const [amounts,expected] of [[[18],18],[[18.5],18.5],[[18,2.35,0.1,0.2],20.65],[[1000.25,18],1018.25],[[],0]]){
 test(`group total for ${JSON.stringify(amounts)}`,()=>{
  const sum=vm.runInNewContext(expression,{expenses:{querySelectorAll:()=>amounts.map(amount=>({dataset:{amount:String(amount)}}))}});
  assert.equal(sum(),expected);
 });
}
test('six participants share an 18 euro expense equally',()=>{
 const sum=vm.runInNewContext(expression,{expenses:{querySelectorAll:()=>[{dataset:{amount:'18.00'}}]}});
 assert.equal(sum()/6,3);
});
