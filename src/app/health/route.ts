import { timeStamp } from "console"
import { uptime } from "process"

export const dynaimc = 'force-static'

export function GET(){
    return Response.json({
        status: 'OK',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    }, {status: 200});
}