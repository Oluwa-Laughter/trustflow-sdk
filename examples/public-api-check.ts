/// <reference types="jest" />
import { WebAuthnManager } from '@trustflow/sdk';
import type {
  WebAuthnCredentialOptions,
  WebAuthnRegistrationOptions,
  WebAuthnSignatureResponse,
} from '@trustflow/sdk';
import { nativeToScVal } from '@stellar/stellar-sdk';
import { toBeValidScVal } from '@trustflow/sdk/testing';

// Compiled by examples:check without the repository's private Jest matcher setup.
const manager = new WebAuthnManager();
const registration: WebAuthnRegistrationOptions = {
  userId: 'dXNlcg',
  username: 'alice',
  rpId: 'example.com',
};
const credential: WebAuthnCredentialOptions = {
  id: 'credential',
  publicKey: 'public-key',
  counter: 0,
};
const signature: WebAuthnSignatureResponse = { signature: 'signature', counter: 1 };
manager.createRegistrationChallenge(registration);
manager.verifySignature(credential, signature);

expect.extend({ toBeValidScVal });
expect(nativeToScVal(100n, { type: 'i128' })).toBeValidScVal();
