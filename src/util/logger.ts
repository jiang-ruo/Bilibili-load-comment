/**
 * @author XiaoLOrange
 * @time 2025.08.05
 * @title 日志模块
 */

import { NAME } from "../const";

enum LogLevel {
	none, // 无日志
	error, // 最严重的日志级别
	warn, // 潜在问题
	info, // 关键信息
	http, // HTTP 请求相关信息
	verbose, // 更详细的信息
	debug, // 调试信息
	silly // 最详细的日志级别
}

const LOG_PREFIX = NAME
const DEFAULT_LOG_LEVEL = LogLevel.silly;

interface Logger<T extends Function> {
	/**
	 * 级别0
	 * 是最严重的日志级别，通常用于记录程序运行时出现的错误信息，这些错误会导致程序无法正常工作或者功能受损。例如，数据库连接失败、文件读写错误等。
	 * @param msg
	 */
	error: T;
	/**
	 * 级别1
	 * 表示潜在的问题，虽然不会立即导致程序崩溃，但可能会在未来引发问题。比如，配置文件中的某些参数即将过期，或者系统资源快耗尽。
	 * @param msg
	 */
	warn: T;
	/**
	 * 级别2
	 * 用于记录程序运行过程中的关键信息，帮助开发者了解程序的运行状态。例如，服务器启动成功、用户登录等。
	 * @param msg
	 */
	info: T;
	/**
	 * 级别3
	 * 专门用于记录 HTTP 请求相关的信息，在 Web 应用里能帮助开发者追踪请求的处理情况。比如，记录请求的 URL、状态码等。
	 * @param msg
	 */
	http: T;
	/**
	 * 级别4
	 * 提供比 info 更详细的信息，主要用于调试和排查问题。不过，这类日志信息较多，可能会影响性能，一般在开发环境使用。
	 * @param msg
	 */
	verbose: T;
	/**
	 * 级别5
	 * 级别日志用于开发阶段的调试，记录详细的程序执行信息，像变量的值、函数的调用等。
	 * @param msg
	 */
	debug: T;
	/**
	 * 级别6
	 * 是最详细的日志级别，包含大量的调试信息，通常在深度调试时使用，生产环境一般不会启用。
	 * @param msg
	 */
	silly: T;
}

class ConsoleLog implements Logger<(...logs: any) => void> {
	#level: LogLevel;
	#module: string;
	constructor(module: string, level: LogLevel = DEFAULT_LOG_LEVEL) {
		this.#level = level;
		this.#module = module;
	}
	trace(...logs: any): void {
		console.trace(LOG_PREFIX, this.#module, ...logs);
	}
	error(...logs: any): void {
		if (this.#level < LogLevel.error) return;
		console.error(LOG_PREFIX, this.#module, ...logs);
	}
	warn(...logs: any): void {
		if (this.#level < LogLevel.warn) return;
		console.warn(LOG_PREFIX, this.#module, ...logs);
	}
	info(...logs: any): void {
		if (this.#level < LogLevel.info) return;
		console.log(LOG_PREFIX, this.#module, ...logs);
	}
	http(...logs: any): void {
		if (this.#level < LogLevel.http) return;
		this.info(...logs);
	}
	verbose(...logs: any): void {
		if (this.#level < LogLevel.verbose) return;
		this.http(...logs);
	}
	debug(...logs: any): void {
		if (this.#level < LogLevel.debug) return;
		console.debug(LOG_PREFIX, this.#module, ...logs);
	}
	silly(...logs: any): void {
		if (this.#level < LogLevel.silly) return;
		this.debug(...logs);
	}

}

const log = new ConsoleLog("default", LogLevel.silly);

export { log, ConsoleLog, LogLevel }