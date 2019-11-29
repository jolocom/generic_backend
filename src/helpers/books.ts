import { JolocomLib } from 'jolocom-lib'
import { publicKeyToDID } from 'jolocom-lib/js/utils/crypto'
import { IVaultedKeyProvider } from 'jolocom-lib/js/vaultedKeyProvider/types'
import { IdentityWallet } from 'jolocom-lib/js/identityWallet/identityWallet'
import * as hash from 'object-hash'
import { Book, LibraryBook } from '../books'
import { IRegistry } from 'jolocom-lib/js/registries/types';

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

export const bookToVKP = (
  isbn: number,
  libDid: string,
  password: string,
  occurance = 0
) => new JolocomLib.KeyProvider(
  Buffer.from(
    hash({
      bookISBN: isbn,
      libDID: libDid,
      occurance
    })
  ),
  password
)

export const bookToID = (
  libDid: string,
) => async (
  isbn: number,
  password: string,
  occurance = 0
) => {
    const reg = JolocomLib.registries.jolocom.create()

    const vkp = bookToVKP(isbn, libDid, password, occurance)

    return await reg.authenticate(vkp, {
      derivationPath: JolocomLib.KeyTypes.jolocomIdentityKey,
      encryptionPass: password
    })
  }

export const setupLibrary = (
  libIdw: IdentityWallet,
  password: string,
  booklist: Book[]
): LibraryBook[] =>
  booklist.map(book => ({
    ...book,
    available: true,
    returnDate: "",
    did: isbnToDID(libIdw.did, password, book.ISBN),
    reads: 0,
    image: `https://papyri.jolocom.com/assets/covers/${book.ISBN}.png`
  }))

export const isbnToDID = (
  libDid: string,
  password: string,
  isbn: number,
  occurance = 0
): string => {
  const vkp = bookToVKP(isbn, libDid, password, occurance)

  return publicKeyToDID(
    vkp.getPublicKey({
      derivationPath: JolocomLib.KeyTypes.jolocomIdentityKey,
      encryptionPass: password
    })
  )
}

export const fuelBook = (
  reg: IRegistry,
  password: string
) => async (
  vkp: IVaultedKeyProvider
) => JolocomLib.util.fuelKeyWithEther(
  vkp.getPublicKey({
    derivationPath: JolocomLib.KeyTypes.ethereumKey,
    encryptionPass: password
  })
)

export const registerBook = (
  reg: IRegistry,
  password: string
) => async (
  vkp: IVaultedKeyProvider
) => reg.create(vkp, password)
