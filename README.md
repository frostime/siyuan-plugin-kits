# SiYuan Plugin Kits

思源笔记插件开发工具包 | A comprehensive utility package for SiYuan plugin development.

[English](#english) | [中文](#中文)

## 中文

这是一个为思源笔记插件开发设计的工具包，旨在简化插件开发流程，提供常用功能的封装。

### 安装

```bash
npm install @frostime/siyuan-plugin-kits
```

### 模块概览

#### 核心模块

##### `plugin-instance.ts`

```ts
// index.ts 插件入口文件
import { registerPlugin } from '@frostime/siyuan-plugin-kits';

class MyPlugin {
    onload() {
        //注册插件和 i18n, app 对象
        const plugin = registerPlugin(this);
    }
}

// 其他模块
import { thisPlugin, app, i18n } from '@frostime/siyuan-plugin-kits';

let plugin = thisPlugin();

```

此外 `thisPlugin()` 返回的是一个 `PluginExtends` 对象，它提供了一些常用的插件方法。具体请参考类型定义文件。

##### `siyuan-instance.ts`
处理思源笔记应用实例相关功能:

- `matchIDFormat(id: string)` 检查字符串是否符合思源笔记文档 ID 格式
- `isMobile()` 检查当前设备是否为移动设备
- `openBlock(id: string, app?: App)` 打开思源笔记文档
- `getNotebook(boxId: string)` 获取 boxId 对应的思源笔记文档对象
- `findPlugin(name: string)` 查找指定名称的插件实例
- `getActiveDoc()` 获取当前活动的 Doc
- `translateHotkey(key: string)` 将快捷键翻译成思源内部接受的格式
  ```js
  const hotkey = translateHotkey('Ctrl+Shift+F');
  ```

##### `api.ts`
思源笔记 API 的完整封装和工具集。
（详细函数参考请查看 API 文档）

#### Settings
- `SettingUtils` 管理插件设置面板和数据的一个快捷工具
- `deepMerge(source: T, target: Partial<T> | any): T` 深度合并两个对象，返回合并后的对象

#### 工具模块

##### `dailynote.ts`
日记相关工具：

- `createDailynote(boxId: NotebookId, todayDiaryHpath: string, date?: Date)` 创建日记
- `searchDailynote(boxId: NotebookId, date: Date)` 搜索日记
- `setCustomDNAttr(doc_id: string, date?: Date)` 设置日记自定义属性

##### `dialog.ts`
对话框和 UI 组件：
- `simpleDialog(args: { title: string, ele: HTMLElement | DocumentFragment, width?: string, height?: string, callback?: () => void; })` 创建简单对话框
- `confirmDialog(args: { title: string, content: string, callback?: (result: boolean) => void; })` 创建确认对话框
- `inputDialog(args: { title: string, defaultText?: string, callback?: (text: string) => void; })` 创建输入对话框

##### `lute.ts`
Markdown 解析和渲染工具：
- `getLute()`: 获取 Lute 对象

##### `time.ts`
时间和日期处理工具：
- `SiYuanDate`: 适配思源内部格式的一个 Date 类
- `formatSiYuanDate(date?: Date)`: 格式化日期为 yyyyMMdd
- `formatSiYuanTimestamp(date?: Date)`: 格式化时间戳为 yyyyMMddHHmmss
- `parseSiYuanTimestamp(timestr: string)`: 将 yyyyMMddHHmmss 格式的时间戳解析为 Date 对象
- `formatDateTime(template: string = 'yyyy-MM-dd HH:mm:ss', now?: Date)`: 格式化日期和时间

##### `performance.ts`
提供一些常用的性能相关的工具:
- `throttle(func: (...args: any[]) => any, wait: number)`: 对函数进行节流操作
- `debounce(func: (...args: any[]) => any, wait: number)`: 对函数进行防抖操作
- `PromiseLimitPool(limit: number)`: 创建一个限制并发数的 Promise 池

##### `const.ts`
插件生态系统中使用的通用常量和配置。
- `BlockTypeName`: 块类型名称映射
- `BlockType2NodeType`: 块类型和节点类型映射
- `NodeIcons`: 不同块默认的 Icon

##### `misc.ts`
一些不知道怎么归类的工具

- `html2frag(html: string)`: 将 HTML 字符串转换为 DocumentFragment
- `html2ele(html: string)`: 将 HTML 字符串转换为 HTMLElement

##### `style.ts`
- `updateStyle(domId: string, css: string)`: 在 Head 中插入一个 style 标签
- `removeStyleDom(domId: string)`: 移除 Head 中的 style 标签


## English

This is a utility package designed for SiYuan Note plugin development, aiming to simplify the plugin development process by providing encapsulation of commonly used functionalities.

### Installation

```bash
npm install @frostime/siyuan-plugin-kits
```

### Module Overview

#### Core Modules

##### `plugin-instance.ts`

```ts
// index.ts plugin entry file
import { registerPlugin } from '@frostime/siyuan-plugin-kits';

class MyPlugin {
    onload() {
        //register plugin and get i18n, app objects
        const plugin = registerPlugin(this);
    }
}

// other modules
import { thisPlugin, app, i18n } from '@frostime/siyuan-plugin-kits';

let plugin = thisPlugin();
```

Additionally, `thisPlugin()` returns a `PluginExtends` object that provides some commonly used plugin methods. Please refer to the type definition file for details.

##### `siyuan-instance.ts`
Handles SiYuan Note application instance-related functionality:

- `matchIDFormat(id: string)` Check if a string matches the SiYuan Note document ID format
- `isMobile()` Check if the current device is mobile
- `openBlock(id: string, app?: App)` Open a SiYuan Note document
- `getNotebook(boxId: string)` Get the notebook object corresponding to boxId
- `findPlugin(name: string)` Find plugin instance by name
- `getActiveDoc()` Get the currently active Doc
- `translateHotkey(key: string)` Translate hotkey to SiYuan's internal format
  ```js
  const hotkey = translateHotkey('Ctrl+Shift+F');
  ```

##### `api.ts`
Complete encapsulation and toolkit for SiYuan Note API.
(Please refer to API documentation for detailed function references)

#### Settings
- `SettingUtils` A utility tool for managing plugin settings panel and data
- `deepMerge(source: T, target: Partial<T> | any): T` Deep merge two objects and return the merged object

#### Utility Modules

##### `dailynote.ts`
Daily note related tools:

- `createDailynote(boxId: NotebookId, todayDiaryHpath: string, date?: Date)` Create daily note
- `searchDailynote(boxId: NotebookId, date: Date)` Search daily note
- `setCustomDNAttr(doc_id: string, date?: Date)` Set custom daily note attributes

##### `dialog.ts`
Dialog and UI components:
- `simpleDialog(args: { title: string, ele: HTMLElement | DocumentFragment, width?: string, height?: string, callback?: () => void; })` Create simple dialog
- `confirmDialog(args: { title: string, content: string, callback?: (result: boolean) => void; })` Create confirmation dialog
- `inputDialog(args: { title: string, defaultText?: string, callback?: (text: string) => void; })` Create input dialog

##### `lute.ts`
Markdown parsing and rendering tools:
- `getLute()`: Get Lute object

##### `time.ts`
Time and date handling tools:
- `SiYuanDate`: A Date class adapted to SiYuan's internal format
- `formatSiYuanDate(date?: Date)`: Format date to yyyyMMdd
- `formatSiYuanTimestamp(date?: Date)`: Format timestamp to yyyyMMddHHmmss
- `parseSiYuanTimestamp(timestr: string)`: Parse yyyyMMddHHmmss format timestamp to Date object
- `formatDateTime(template: string = 'yyyy-MM-dd HH:mm:ss', now?: Date)`: Format date and time

##### `performance.ts`
Provides some commonly used performance-related tools:
- `throttle(func: (...args: any[]) => any, wait: number)`: Throttle function calls
- `debounce(func: (...args: any[]) => any, wait: number)`: Debounce function calls
- `PromiseLimitPool(limit: number)`: Create a Promise pool with limited concurrency

##### `const.ts`
Common constants and configurations used in the plugin ecosystem:
- `BlockTypeName`: Block type name mapping
- `BlockType2NodeType`: Block type and node type mapping
- `NodeIcons`: Default icons for different blocks

##### `misc.ts`
Miscellaneous utilities that don't fit elsewhere:

- `html2frag(html: string)`: Convert HTML string to DocumentFragment
- `html2ele(html: string)`: Convert HTML string to HTMLElement

##### `style.ts`
- `updateStyle(domId: string, css: string)`: Insert a style tag in Head
- `removeStyleDom(domId: string)`: Remove style tag from Head

