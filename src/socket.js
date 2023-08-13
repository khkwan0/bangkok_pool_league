import {io} from 'socket.io-client'
import config from '~/config'

export const socket = io('https://' + config.domain, {autoConnect: false})
