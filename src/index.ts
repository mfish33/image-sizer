import { Buffer } from 'buffer';
import * as _parsers from './parsers.js'
import { ProbeResult } from './common'

const parsers: { [key: string]: (buffer:Buffer) => null |  ProbeResult} = _parsers as any

export default function(arrayBuffer:ArrayBuffer, fileExt?:string):ProbeResult | null {
    let buffer = Buffer.from(arrayBuffer)

    if(fileExt) {
        if(parsers[fileExt]) {
            return parsers[fileExt](buffer)
        } else {
            return null
        }
    }

    for(let key of Object.keys(parsers)) {
        let parsed = parsers[key](buffer)
        if(parsed) {
            return parsed
        }
    }

    return null
}