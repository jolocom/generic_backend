import { JolocomLib } from 'jolocom-lib'
import * as hash from 'object-hash'
import { IVaultedKeyProvider } from 'jolocom-lib/js/vaultedKeyProvider/types'

import {
    bookList,
    seed,
    password
} from './src/config';
import { IdentityWallet } from 'jolocom-lib/js/identityWallet/identityWallet'

export const setupDID = async (kp: IVaultedKeyProvider, pass: string) => {
    await JolocomLib.util.fuelKeyWithEther(kp.getPublicKey({
        encryptionPass: password,
        derivationPath: JolocomLib.KeyTypes.ethereumKey
    }))

    return await JolocomLib.registries.jolocom.create().create(kp, pass)
}

export const setupLibrary = async (libvkp: IVaultedKeyProvider, password: string, booklist: number[]) =>
    setupDID(libvkp, password)
        .then(async (libIdw) =>
            booklist
                .map((isbn): IVaultedKeyProvider => {  // 1. get key providers from isbns
                    return new JolocomLib.KeyProvider(Buffer.from(hash({
                        bookISBN: isbn,
                        libDID: libIdw.did
                    })), password)
                }).map(async (vkp: IVaultedKeyProvider): Promise<IVaultedKeyProvider> =>  // 2. fuel keys
                    JolocomLib.util.fuelKeyWithEther(vkp.getPublicKey({
                        encryptionPass: password,
                        derivationPath: JolocomLib.KeyTypes.ethereumKey
                    })).then(_ => vkp)
                ).map(async (vkpp: Promise<IVaultedKeyProvider>): Promise<IdentityWallet> =>  // 3. anchor book
                    vkpp.then(vkp => JolocomLib.registries.jolocom.create().create(vkp, password))))
        .catch(console.log)
