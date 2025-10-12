import { Plugin } from 'vite';
import fs from 'fs'
import path from 'path'
import { UserScript } from '../header/UserScript';

const getScript = (): UserScript | { name: string } | undefined => {
    try {
        const script = require('../header').default;
        if (!script) throw new Error("未找到header/inex.ts")
        return script;
    } catch (e) {
        // 如果找不到../header，则尝试读取../header/head文件
        try {
            console.log("读取header/index.ts文件失败，尝试加载header/head文件")
            const headPath = path.join(__dirname, '../header/head');
            // 文件不存在，直接返回
            if (!fs.existsSync(headPath)) return
            const content = fs.readFileSync(headPath, 'utf-8');

            // 更精确的油猴脚本@name匹配
            // 1. 首先检查是否在UserScript块中
            const userScriptMatch = content.match(/\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==/);
            if (!userScriptMatch) return;

            // 2. 在UserScript块中匹配@name
            const userScriptContent = userScriptMatch[0];
            const nameMatch = userScriptContent.match(/@name\s+([^\r\n]+)/);
            if (nameMatch) {
                const name = nameMatch[1].trim();
                return { name };
            }
        } catch (e2) {
            // 读取失败，返回undefined
            return;
        }
    }
}

export default (): Plugin => {
    return {
        name: 'sync-plugin',
        closeBundle(){
            let script = getScript();
            if(!script) return;
            const files = fs.readdirSync('temp/Tampermonkey/sync',{ withFileTypes: true })
            const jsonFiles = files.filter(file => file.isFile() && file.name.endsWith('.meta.json'))
            for(const file of jsonFiles){
                const filePath = path.join('temp/Tampermonkey/sync', file.name);
                const content = fs.readFileSync(filePath, 'utf-8')
                const {uuid,name} = JSON.parse(content);
                if(name === script.name){
                    const jsName = path.join('temp/Tampermonkey/sync',`${uuid}.user.js`)
                    fs.copyFileSync('dist/main.js',jsName)
                    console.log('copied file to:', jsName)
                    return;
                }
            }

            throw new Error("找不到对应名称的脚本:" + script.name)
        }
    }
}