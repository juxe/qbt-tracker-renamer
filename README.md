This is a script that will connect to a qbittorrent instance, get torrent data
for all torrents, and add QBT_NEW_TRACKER tracker URL to any torrents that
have a tracker matching QBT_OLD_TRACKER but don't have a tracker matching
QBT_NEW_TRACKER. The script will stay running and execute this action every 2
minutes unless configured for a different throttle time.

Copy .env.example file to .env and change the values for your qbittorrent
instance and desired tracker URLs. Install dependencies with `npm i` and start
using `npm start`.
