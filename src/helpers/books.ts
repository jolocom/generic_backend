import { JolocomLib } from 'jolocom-lib'
import { publicKeyToDID } from 'jolocom-lib/js/utils/crypto'
import { IVaultedKeyProvider } from 'jolocom-lib/js/vaultedKeyProvider/types'
import { IdentityWallet } from 'jolocom-lib/js/identityWallet/identityWallet'
import * as hash from 'object-hash'

export const setupDID = async (
  kp: IVaultedKeyProvider,
  pass: string
): Promise<IdentityWallet> => {
  const reg = JolocomLib.registries.jolocom.create()
  try {
    return reg.authenticate(kp, {
      derivationPath: JolocomLib.KeyTypes.jolocomIdentityKey,
      encryptionPass: pass
    })
  } catch (err) {
    await JolocomLib.util.fuelKeyWithEther(
      kp.getPublicKey({
        derivationPath: JolocomLib.KeyTypes.ethereumKey,
        encryptionPass: pass
      })
    )
    return reg.create(kp, pass)
  }
}

export const setupLibrary = (
  libIdw: IdentityWallet,
  password: string,
  booklist: number[]
) =>
  booklist.map((isbn: number): { isbn: number; did: string } => {
    return {
      isbn: isbn,
      did: isbnToDID(libIdw.did, password, isbn)
    }
  })

export const isbnToDID = (
  libDid: string,
  password: string,
  isbn: number,
  occurance: number = 0
): string => {
  const vkp = new JolocomLib.KeyProvider(
    Buffer.from(
      hash({
        bookISBN: isbn,
        libDID: libDid,
        occurance
      })
    ),
    password
  )

  return publicKeyToDID(
    vkp.getPublicKey({
      derivationPath: JolocomLib.KeyTypes.jolocomIdentityKey,
      encryptionPass: password
    })
  )
}
