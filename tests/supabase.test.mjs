import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createDatabase} from '../lib/supabase.ts';
const config={url:'https://example.supabase.co',key:'sb_secret_test'};
test('server REST client preserves tokens, pagination and private key handling',async t=>{
 const calls=[];
 const responses=[true,501,[{id:'last'}],[],[{id:'teacher'}],[]];
 t.mock.method(globalThis,'fetch',async(url,options)=>{calls.push({url:String(url),...options});return Response.json(responses.shift())});
 const db=createDatabase(config);
 assert.equal(await db.saveVisit('id','Test','0771234567','hashed-token'),true);
 assert.equal(await db.count(),501);
 assert.equal((await db.students(50,500))[0].id,'last');
 assert.equal(await db.completeVisit('id','wrong-token','teacher',{name:'Teacher',subject:'Science'}),false);
 assert.equal((await db.classes()).length,1);
 assert.deepEqual(JSON.parse(calls[0].body),{p_id:'id',p_name:'Test',p_phone:'0771234567',p_token:'hashed-token'});
 assert.equal(calls[0].headers.apikey,'sb_secret_test');
 assert.equal(calls[0].headers.Authorization,undefined);
 assert.equal(calls[0].cache,'no-store');
 assert.equal(new URL(calls[2].url).searchParams.get('offset'),'500');
 assert.equal(new URL(calls[3].url).searchParams.get('edit_token'),'eq.wrong-token');
});
test('missing config and database errors fail safely; legacy server JWT supported',async t=>{
 assert.throws(()=>createDatabase({}),/Configure SUPABASE/);
 let authorization;
 t.mock.method(globalThis,'fetch',async(url,options)=>{authorization=options.headers.Authorization;return Response.json({code:'42P01',message:'private database details'},{status:400})});
 await assert.rejects(createDatabase({...config,key:'legacy-jwt'}).count(),error=>error.message.includes('42P01')&&!error.message.includes('private database'));
 assert.equal(authorization,'Bearer legacy-jwt');
});
