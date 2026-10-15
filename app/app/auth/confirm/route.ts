import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request:NextRequest){
 const token_hash=request.nextUrl.searchParams.get('token_hash');
 const type=request.nextUrl.searchParams.get('type');
 const base=new URL('/login',request.url);
 if(!token_hash || type!=='email'){base.searchParams.set('error','invalid_confirmation');return NextResponse.redirect(base)}
 const cookieStore=await cookies();
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key){base.searchParams.set('error','not_configured');return NextResponse.redirect(base)}
 const client=createServerClient(url,key,{cookies:{
  getAll(){return cookieStore.getAll()},
  setAll(items: Array<{name:string;value:string;options?:{path?:string;domain?:string;maxAge?:number;expires?:Date;httpOnly?:boolean;secure?:boolean;sameSite?:'lax'|'strict'|'none'|boolean}}>) {
   items.forEach(({name,value,options})=>cookieStore.set(name,value,options));
  }
 }});
 const {error}=await client.auth.verifyOtp({token_hash,type:'email'});
 if(error){base.searchParams.set('error','confirmation_failed')}else{base.searchParams.set('confirmed','1')}
 return NextResponse.redirect(base);
}
