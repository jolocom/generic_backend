const { JolocomLib } = require('jolocom-lib')

const seed = Buffer.from(process.argv[2], 'hex')

const password = 'correct horse battery staple'

const register = async (s, p) => {
  const vkp = JolocomLib.KeyProvider.fromSeed(s, p)
  console.log('seed valid...')

  console.log('fueling...')
  await JolocomLib.util.fuelKeyWithEther(
    vkp.getPublicKey({
      derivationPath: JolocomLib.KeyTypes.ethereumKey,
      encryptionPass: p
    })
  )

  console.log('registering...')
  const r = JolocomLib.registries.jolocom.create()
  await r.create(vkp, p)
}

register(seed, password)
