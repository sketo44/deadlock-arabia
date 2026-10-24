import {createPublicKey,verify as verifySignature} from 'node:crypto';
export function validDiscordSignature(raw,timestamp,signature,publicKey,now=Date.now()){
 if(!/^\d{10}$/.test(timestamp||'')||Math.abs(now-Number(timestamp)*1000)>300000||!/^[a-f0-9]{128}$/i.test(signature||'')||!/^[a-f0-9]{64}$/i.test(publicKey||''))return false;
 try{const key=createPublicKey({key:Buffer.from('302a300506032b6570032100'+publicKey,'hex'),format:'der',type:'spki'});return verifySignature(null,Buffer.from(timestamp+raw),key,Buffer.from(signature,'hex'))}catch{return false}
}
