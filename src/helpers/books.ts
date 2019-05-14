import { JolocomLib } from 'jolocom-lib'
import { publicKeyToDID } from 'jolocom-lib/js/utils/crypto'
import { IVaultedKeyProvider } from 'jolocom-lib/js/vaultedKeyProvider/types'
import { IdentityWallet } from 'jolocom-lib/js/identityWallet/identityWallet'
import { Identity } from 'jolocom-lib/js/identity/identity';
import { DidDocument } from 'jolocom-lib/js/identity/didDocument/didDocument';
import * as hash from 'object-hash'
import { JolocomRegistry } from 'jolocom-lib/js/registries/jolocomRegistry';

export const setupDID = async (kp: IVaultedKeyProvider, pass: string): Promise<IdentityWallet> => {
    const reg = JolocomLib.registries.jolocom.create();
    try {
        return reg.authenticate(kp, {
            derivationPath: JolocomLib.KeyTypes.jolocomIdentityKey,
            encryptionPass: pass
        })
    } catch (err) {
        await JolocomLib.util.fuelKeyWithEther(kp.getPublicKey({
            derivationPath: JolocomLib.KeyTypes.ethereumKey,
            encryptionPass: pass
        }))
        return reg.create(kp, pass)
    }
}

export const setupLibrary = (libIdw: IdentityWallet, password: string, booklist: number[]) => {
    const reg = JolocomLib.registries.jolocom.create()
    return booklist
        .map((isbn: number): { isbn: number, idw: IdentityWallet } => {
            const vkp = new JolocomLib.KeyProvider(Buffer.from(hash({
                bookISBN: isbn,
                libDID: libIdw.did
            })), password)
            const id = Identity.fromDidDocument({
                didDocument: DidDocument.fromPublicKey(vkp.getPublicKey({
                    derivationPath: JolocomLib.KeyTypes.jolocomIdentityKey,
                    encryptionPass: password
                }))
            })
            return {
                isbn: isbn,
                idw: new IdentityWallet({
                    identity: id,
                    vaultedKeyProvider: vkp,
                    publicKeyMetadata: {
                        derivationPath: JolocomLib.KeyTypes.jolocomIdentityKey,
                        keyId: id.didDocument.publicKey[0].id
                    },
                    contractsAdapter: reg.contractsAdapter,
                    contractsGateway: reg.contractsGateway
                })
            }
        })
}
