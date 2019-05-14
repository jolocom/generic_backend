import { JolocomLib } from 'jolocom-lib'
import { publicKeyToDID } from 'jolocom-lib/js/utils/crypto'
import * as hash from 'object-hash'
import { IVaultedKeyProvider } from 'jolocom-lib/js/vaultedKeyProvider/types'

import { IdentityWallet } from 'jolocom-lib/js/identityWallet/identityWallet'

export const setupDID = async (kp: IVaultedKeyProvider, pass: string): Promise<IdentityWallet> => {
    const reg = JolocomLib.registries.jolocom.create();
    reg.authenticate(kp, {
        derivationPath: JolocomLib.KeyTypes.jolocomIdentityKey,
        encryptionPass: pass
    })
        .then(idw => { return idw })
        .catch(err => {
            JolocomLib.util.fuelKeyWithEther(kp.getPublicKey({
                derivationPath: JolocomLib.KeyTypes.ethereumKey,
                encryptionPass: pass
            }))
                .then(_ => { return reg.create(kp, pass) })
        })
}


export const setupLibrary = async (libIdw: IdentityWallet, password: string, booklist: number[]) =>
    booklist
        .map((isbn: number): Promise<{ isbn: number, idw: IdentityWallet }> =>
            setupDID(new JolocomLib.KeyProvider(Buffer.from(hash({
                bookISBN: isbn,
                libDID: libIdw.did
            })), password), password)
                .then(idw => {
                    return {
                        isbn: isbn,
                        idw: idw
                    }
                }))
