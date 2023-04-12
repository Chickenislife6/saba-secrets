import type {
  KeyPairType,
  PreKeyPairType,
  PreKeyType,
  SignedPreKeyPairType,
  SignedPublicPreKeyType,
} from '@privacyresearch/libsignal-protocol-typescript'

export type UserKeys<T = ArrayBuffer> = {
  identityKeyPair: KeyPairType<T>
  signedPreKey: SignedPreKeyPairType<T>
  oneTimePreKey: PreKeyPairType<T>
}

export type PublicUserKeys<T = ArrayBuffer> = {
  identityPublicKey: T
  signedPreKey: SignedPublicPreKeyType<T>
  oneTimePreKey: PreKeyType<T>
}
