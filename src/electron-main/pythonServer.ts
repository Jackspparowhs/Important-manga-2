import { spawn } from 'child_process';
import { app } from 'electron';
import fs from 'fs';
import path from 'path';

import { isViteDEV } from '../constants/env';

function getPythonServerCMD() {
    if (isViteDEV) {
        return {
            command: 'python',
            args: ['backend/LiSA.py']
        };
    }

    switch (process.platform) {
        case 'win32':
            return {
                command: path.join(process.resourcesPath, 'resources/lisa', 'LiSA.exe'),
                args: []
            };
        case 'linux':
        case 'darwin':
            return {
                command: path.join(process.resourcesPath, 'resources/lisa', 'LiSA'),
                args: []
            };
        default:
            return null;
    }
}

export function startPythonServer() {
    const cmdConfig = getPythonServerCMD();
    if (!cmdConfig) {
        console.error('Unsupported platform or failed to get the command to run python server.');
        return;
    }

    const logPath = path.join(
        isViteDEV ? app.getAppPath() : path.dirname(process.execPath),
        'LiSA.log',
    );

    fs.writeFileSync(logPath, '', { encoding: 'utf8' }); // clear logs

    const pythonServer = spawn(cmdConfig.command, cmdConfig.args, {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, PYTHONUNBUFFERED: '1' }
    });

    const logStream = fs.createWriteStream(logPath, { flags: 'a' });
    pythonServer.stdout.pipe(logStream);
    pythonServer.stderr.pipe(logStream);

    pythonServer.on('close', (code) => {
        console.log(`Python server exited with code ${code}`);
        logStream.end();
    });

    pythonServer.on('error', (err) => {
        console.error('Failed to start Python server:', err);
    });
}

export function killPythonServer() {
    if (process.platform === 'win32') {
        const killCmd = `tskill LiSA`;
        spawn('cmd.exe', ['/c', killCmd]);
    } else {
        const killCmd = 'pkill -f LiSA';
        spawn('sh', ['-c', killCmd]);
    }
}
