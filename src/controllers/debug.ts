// import {password} from '../../config'
// import {Response} from 'express'
// import {IdentityWallet} from 'jolocom-lib/js/identityWallet/identityWallet'
// import { JolocomLib } from 'jolocom-lib';
// import { KeyTypes } from 'jolocom-lib/js/vaultedKeyProvider/types';
// import { fuelKeyWithEther } from 'jolocom-lib/js/utils/helper';
// import { randomBytes } from 'crypto';
//
// const generateCredential = async (
//   identityWallet: IdentityWallet,
//   credentialData: any, // TODO
//   res: Response
// ) => {
//   try {
//     const credential = await identityWallet.create.signedCredential(credentialData, password);
//     return res.status(200).send({credential: credential.toJSON()})
//   } catch (err) {
//     return res.status(500).send({error: err.message})
//   }
// }
//
// const createIdentity = async (res: Response, entropy = randomBytes(32)) => {
//   const encryptionPass = 'ephimeral'
//   try {
//     const vault = new JolocomLib.KeyProvider(entropy, encryptionPass)
//
//     const ethKey = vault.getPublicKey({
//       derivationPath: KeyTypes.ethereumKey,
//       encryptionPass
//     })
//
//     await fuelKeyWithEther(ethKey)
//     await (JolocomLib.registries.jolocom.create()).create(vault, encryptionPass)
//
//     res.send({entropy: entropy.toString('hex')})
//     } catch (err) {
//       res.status(500).send({error: err.message})
//     }
// }
