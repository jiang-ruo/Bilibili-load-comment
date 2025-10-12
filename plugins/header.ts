import { Plugin } from 'vite';
import {GmFunctions, UserScript} from "../header/UserScript";
import {readFileSync} from "fs";
import format from "string-template"

const padLen = 20

const buildHeaderFromIndex = (script: UserScript) => {
    let result = '// ==UserScript==\n'
    if (script.name) {
        result += '// @name'.padEnd(padLen, ' ') + script.name + '\n'
    }
    if (script.namespace) {
        result += '// @namespace'.padEnd(padLen, ' ') + script.namespace + '\n'
    }
    if (script.version) {
        result += '// @version'.padEnd(padLen, ' ') + script.version + '\n'
    }
    if (script.author) {
        result += '// @author'.padEnd(padLen, ' ') + script.author + '\n'
    }
    if (script.description) {
        result += '// @description '.padEnd(padLen, ' ') + script.description + '\n'
    }
    if (script.homepage) {
        result += '// @homepage'.padEnd(padLen, ' ') + script.homepage + '\n'
    }
    if (script.icon) {
        result += '// @icon'.padEnd(padLen, ' ') + script.icon + '\n'
    }
    if (script.icon64) {
        result += '// @icon64'.padEnd(padLen, ' ') + script.icon64 + '\n'
    }
    if (script.updateURL) {
        result += '// @updateURL'.padEnd(padLen, ' ') + script.updateURL + '\n'
    }
    if (script.supportURL) {
        result += '// @supportURL'.padEnd(padLen, ' ') + script.supportURL + '\n'
    }
    if (script.downloadURL) {
        result += '// @downloadURL'.padEnd(padLen, ' ') + script.downloadURL + '\n'
    }
    if (script.includes) {
        script.includes.forEach(include => {
            result += '// @include'.padEnd(padLen, ' ') + include + '\n'
        })
    }
    if (script.matches) {
        script.matches.forEach(m => {
            result += '// @match'.padEnd(padLen, ' ') + m + '\n'
        })
    }
    if (script.excludes) {
        script.excludes.forEach(exclude => {
            result += '// @exclude'.padEnd(padLen, ' ') + exclude + '\n'
        })
    }
    if (script.requires) {
        script.requires.forEach(m => {
            result += '// @require'.padEnd(padLen, ' ') + m + '\n'
        })
    }
    if (script.resources) {
        script.resources.forEach(m => {
            result += '// @resource '.padEnd(padLen, ' ') + m + '\n'
        })
    }
    if (script.connect) {
        result += '// @connect'.padEnd(padLen, ' ') + script.connect + '\n'
    }
    if (script.runAt) {
        result += '// @run-at'.padEnd(padLen, ' ') + script.runAt + '\n'
    }
    if (script.grants) {
        function grantParser(grant: string | GmFunctions) {
            if (typeof grant === 'string') {
                return '// @grant'.padEnd(padLen, ' ') + grant + '\n';
            } else {
                return '// @grant'.padEnd(padLen, ' ') + GmFunctions[grant] + '\n';
            }
        }
        const grants: Array<string | GmFunctions> = Array.isArray(script.grants) ? script.grants : [script.grants];
        for (const grant of grants) {
            result += grantParser(grant);
        }
    }
    if (script.noframes) {
        //此处之前少了 “//”，感谢 没礼貌的芬兰人 的评论
        //https://gitee.com/ironV/tampermonkey-typescript/blob/master/header/build.ts#note_12538220
        result += '// @noframes\n'
    }
    if (script.nocompat) {
        result += '// @nocompat'.padEnd(padLen, ' ') + script.nocompat + '\n'
    }
    if (script.license) {
        result += `// @license ${script.license}\n`
    }
    result += '// ==/UserScript==\n'



    if (script.comment) {
        result += '//\n'
        function parseCommentString(comment: string): string {
            // 检测是否包含换行符
            if (comment.includes('\n')) {
                return comment.split('\n')
                    .map(line => parseCommentString(line))
                    .join('\n');
            } else {
                // 去除左侧的空格后检测是否以//开始
                if (comment.trimStart().startsWith('//')) {
                    return comment.trimStart();
                } else {
                    return `// ${comment}`;
                }
            }
        }
        if (typeof script.comment === 'string') {
            result += `${parseCommentString(script.comment)}\n`
        } else {
            script.comment.forEach(c => {
                result += `${parseCommentString(c)}\n`
            })
        }
    }
    if (script.declares) {
        if (typeof script.declares === 'string') {
            result += `/* global ${script.declares} */\n`
        } else {
            script.declares.forEach(d => {
                result += `/* global ${d} */\n`
            })
        }
    }

    return result;
}

const loadHeader = (meta?: {[key: string]: string | number}): UserScript | string | undefined =>  {
    try{
        const script: UserScript = require('../header').default
        if(!script) throw new Error('未找到header/inex.ts');
        return script;
    } catch (e) {
        try {
            console.log("读取header/index.ts文件失败，尝试加载header/head文件");
            const header: string = readFileSync('./header/head', 'utf-8');
            const result = format(header, meta);
            // 最后一个符号不是\n则添加\n
            return result.endsWith('\n') ? result : result + '\n';
        } catch (e) {
            return;
        }
    }
}

/**
 *
 * @returns 如果存在header/index.ts文件，则优先从index.ts中构造header，
 *          如果不存在，则从header/head中直接读取header
 */
const buildHeader = (meta?: {[key: string]: string | number}): string => {
    const script = loadHeader(meta);
    if(!script) return "";
    if(typeof script === 'string') {
        return script;
    } else {
        return buildHeaderFromIndex(script);
    }
}

const headerPlugin = (meta?: {[key: string]: string | number}): Plugin => {
    return {
        name: 'header-plugin',
        generateBundle(_, bundle) {
            for (const fileName of Object.keys(bundle)) {
                if (fileName === 'main.js') {
                    const file = bundle[fileName];
                    if (file.type === 'chunk'&& file.code) {
                        const header = buildHeader(meta)
                        file.code = header + file.code;
                    }
                }
            }
        }
    }
}

export default headerPlugin