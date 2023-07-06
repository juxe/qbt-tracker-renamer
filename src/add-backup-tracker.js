import api from 'qbittorrent-api-v2'
import {decode} from 'magnet-uri'
import {config} from 'dotenv'

const vars = [
  'QBT_HOST',
  'QBT_USERNAME',
  'QBT_PASSWORD',
  'QBT_OLD_TRACKER',
  'QBT_NEW_TRACKER',
]

async function addBackupTracker () {
  config()

  for (const v of vars) {
    if (!process.env[v]) {
      console.log(`${v} environment variable is not set`)
      process.exit(1)
    }
  }
  const host = process.env.QBT_HOST
  const username = process.env.QBT_USERNAME
  const password = process.env.QBT_PASSWORD
  const oldTracker = process.env.QBT_OLD_TRACKER
  const newTracker = process.env.QBT_NEW_TRACKER

  // console.log(host, username, password)
  const qbt = await api.connect(host, username, password)
  console.log('connected to qbittorrent instance at', host)
  const torrents = await qbt.torrents()
  console.log('found', torrents.length, 'torrents')
  for (const torrent of torrents) {
    // if torrent has a tracker set
    if (torrent.tracker) {
      // find all trackers for this torrent
      const trackers = await qbt.trackers(torrent.hash)
      // check each tracker url for match
      const hasOldTracker = !!trackers.find(v => v.url === oldTracker)
      const hasNewTracker = !!trackers.find(v => v.url === newTracker)
      if (hasOldTracker && !hasNewTracker) {
        // add new tracker
        await qbt.addTrackers(torrent.hash, newTracker)
        console.log(torrent.name, 'added tracker', newTracker)
      }
    } else {
      // no tracker set - use magnet URI
      // parse the magnet URI
      const parsed = decode(torrent.magnet_uri)
      // if magnet URI uses old tracker
      if (parsed.tr === oldTracker) {
        // set new tracker
        await qbt.addTrackers(torrent.hash, newTracker)
        console.log(torrent.name, 'added tracker', newTracker)
      }
    }
  }
}

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

while (true) {
  try {
    await addBackupTracker()
  } catch (e) {
    // log and continue
    console.log(e)
  }
  await sleep(2 * 60 * 1000)
}
